const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');

// Set FFmpeg path - auto-detect for different environments
if (process.platform === 'win32') {
  // Windows local development
  ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');
  ffmpeg.setFfprobePath('C:\\ffmpeg\\bin\\ffprobe.exe');
} else {
  // Linux/Unix (production deployment) - FFmpeg should be in PATH
  // Most cloud platforms have FFmpeg pre-installed
  try {
    ffmpeg.setFfmpegPath('ffmpeg');
    ffmpeg.setFfprobePath('ffprobe');
  } catch (error) {
    console.log('Using system FFmpeg from PATH');
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads and output directories
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(outputDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for better flexibility
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/quicktime',
      'video/x-msvideo',
      'video/mkv',
      'video/x-matroska',
      'video/webm',
      'video/3gpp',
      'video/x-flv',
      'video/x-ms-wmv'
    ];

    const allowedExtensions = [
      '.mp4', '.avi', '.mov', '.mkv', '.webm',
      '.3gp', '.flv', '.wmv', '.m4v', '.mpg',
      '.mpeg', '.ogv'
    ];

    const fileExtension = file.originalname.toLowerCase();
    const hasValidMimeType = allowedMimeTypes.some(type => file.mimetype.includes(type));
    const hasValidExtension = allowedExtensions.some(ext => fileExtension.endsWith(ext));

    if (hasValidMimeType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported video format. Please upload a common video file.'), false);
    }
  }
});

// Store conversion progress
const conversionProgress = new Map();

// Check if FFmpeg is available
function checkFFmpegAvailability() {
  return new Promise((resolve) => {
    const ffmpegCommand = process.platform === 'win32' ? '"C:\\ffmpeg\\bin\\ffmpeg.exe"' : 'ffmpeg';
    exec(`${ffmpegCommand} -version`, (error) => {
      resolve(!error);
    });
  });
}

// Validate output video duration to ensure it's under 3 seconds
function validateOutputDuration(outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(outputPath, (err, metadata) => {
      if (err) {
        reject(new Error('Unable to read output video metadata'));
        return;
      }

      const duration = parseFloat(metadata.format.duration);
      console.log(`Output video duration: ${duration} seconds`);

      if (duration > 3.0) {
        reject(new Error(`Output video duration (${duration.toFixed(2)}s) exceeds 3 seconds`));
        return;
      }

      resolve(duration);
    });
  });
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload and convert video
app.post('/api/convert', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }

  // Check if FFmpeg is available
  const ffmpegAvailable = await checkFFmpegAvailability();
  if (!ffmpegAvailable) {
    console.log('ERROR: FFmpeg not available');
    // Clean up uploaded file
    fs.remove(req.file.path).catch(console.error);
    return res.status(503).json({
      error: 'Video conversion service is temporarily unavailable. FFmpeg is not installed or accessible.',
      details: 'This is likely a deployment configuration issue. Please contact support.',
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development',
      isRailway: process.env.RAILWAY_ENVIRONMENT !== undefined
    });
  }

  const inputPath = req.file.path;
  const outputFilename = `converted-${Date.now()}.webm`;
  const outputPath = path.join(outputDir, outputFilename);
  const conversionId = Date.now().toString();

  // Initialize progress tracking
  conversionProgress.set(conversionId, { progress: 0, stage: 'preparing' });

  res.json({ 
    message: 'Conversion started', 
    conversionId: conversionId,
    originalName: req.file.originalname
  });

  // Start FFmpeg conversion with optimized settings for small file size and 3-second limit
  ffmpeg(inputPath)
    .videoFilters([
      // Scale to fit within 512x512 while preserving aspect ratio
      'scale=512:512:force_original_aspect_ratio=decrease',
      // Pad to exactly 512x512 with black bars
      'pad=512:512:(ow-iw)/2:(oh-ih)/2:black'
    ])
    .videoCodec('libvpx-vp9')
    .audioCodec('libopus')
    .videoBitrate('400k')        // Reduced for smaller file size
    .audioBitrate('64k')         // Reduced for smaller file size
    .inputOptions(['-ss 0'])     // Start from beginning
    .outputOptions(['-t 2.9'])   // Cut to exactly 2.9 seconds
    .format('webm')
    .addOptions([
      '-threads 0',              // Use all available CPU cores
      '-speed 6',                // Faster encoding for smaller files
      '-tile-columns 1',         // VP9 optimization for small videos
      '-frame-parallel 1',       // Enable frame parallel processing
      '-crf 35',                 // Higher CRF for smaller file size
      '-deadline realtime',      // Optimize for speed
      '-cpu-used 5',             // Faster encoding
      '-static-thresh 0',        // Disable static threshold
      '-max-intra-rate 300',     // Limit intra frame rate
      '-lag-in-frames 0',        // No lag for real-time encoding
      '-avoid_negative_ts make_zero', // Ensure proper timing (corrected syntax)
      '-fflags', '+genpts'       // Generate presentation timestamps (corrected syntax)
    ])
    .on('start', (commandLine) => {
      console.log('FFmpeg started with command:', commandLine);
      conversionProgress.set(conversionId, { progress: 5, stage: 'converting' });
    })
    .on('progress', (progress) => {
      const percent = Math.round(progress.percent || 0);
      conversionProgress.set(conversionId, { 
        progress: Math.min(percent, 95), 
        stage: 'converting' 
      });
      console.log(`Conversion progress: ${percent}%`);
    })
    .on('end', async () => {
      console.log('Conversion finished');

      try {
        // Validate output duration to ensure it's under 3 seconds
        const duration = await validateOutputDuration(outputPath);
        console.log(`Output video validated: ${duration.toFixed(2)} seconds`);

        // Check output file size (must be under 256 KB)
        const stats = await fs.stat(outputPath);
        const fileSizeKB = stats.size / 1024;

        if (fileSizeKB > 256) {
          console.log(`Output file too large: ${fileSizeKB.toFixed(2)} KB`);
          conversionProgress.set(conversionId, {
            progress: 0,
            stage: 'error',
            error: 'Output file exceeds 256KB limit. Try a shorter or lower quality video.'
          });

          // Clean up files
          fs.remove(inputPath).catch(console.error);
          fs.remove(outputPath).catch(console.error);
          return;
        }

        console.log(`Output file size: ${fileSizeKB.toFixed(2)} KB, Duration: ${duration.toFixed(2)}s`);
        conversionProgress.set(conversionId, {
          progress: 100,
          stage: 'completed',
          outputPath: outputPath,
          outputFilename: outputFilename
        });

        // Clean up input file
        fs.remove(inputPath).catch(console.error);
      } catch (error) {
        console.error('Output validation failed:', error);
        conversionProgress.set(conversionId, {
          progress: 0,
          stage: 'error',
          error: error.message
        });

        // Clean up files
        fs.remove(inputPath).catch(console.error);
        fs.remove(outputPath).catch(console.error);
      }
    })
    .on('error', (err) => {
      console.error('FFmpeg error:', err);
      conversionProgress.set(conversionId, { 
        progress: 0, 
        stage: 'error', 
        error: err.message 
      });
      
      // Clean up files
      fs.remove(inputPath).catch(console.error);
      fs.remove(outputPath).catch(console.error);
    })
    .save(outputPath);
});

// Get conversion progress
app.get('/api/progress/:conversionId', (req, res) => {
  const { conversionId } = req.params;
  const progress = conversionProgress.get(conversionId);
  
  if (!progress) {
    return res.status(404).json({ error: 'Conversion not found' });
  }
  
  res.json(progress);
});

// Download converted video
app.get('/api/download/:conversionId', async (req, res) => {
  try {
    const { conversionId } = req.params;
    const progress = conversionProgress.get(conversionId);

    if (!progress || progress.stage !== 'completed') {
      return res.status(404).json({ error: 'Conversion not completed or not found' });
    }

    const filePath = progress.outputPath;
    const filename = progress.outputFilename || 'converted-video.webm';

    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Converted file not found on disk' });
    }

    // Set proper headers for download
    res.setHeader('Content-Type', 'video/webm');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send the file
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file' });
        }
      } else {
        console.log(`File downloaded successfully: ${filename}`);
        // Clean up the file after download
        setTimeout(() => {
          fs.remove(filePath).catch(console.error);
          conversionProgress.delete(conversionId);
        }, 5000); // 5 second delay to ensure download completes
      }
    });
  } catch (error) {
    console.error('Download endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clean up old files periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  
  // Clean up old conversions from memory
  for (const [id, data] of conversionProgress.entries()) {
    if (now - parseInt(id) > maxAge) {
      conversionProgress.delete(id);
    }
  }
  
  // Clean up old files
  [uploadsDir, outputDir].forEach(dir => {
    fs.readdir(dir).then(files => {
      files.forEach(file => {
        const filePath = path.join(dir, file);
        fs.stat(filePath).then(stats => {
          if (now - stats.mtime.getTime() > maxAge) {
            fs.remove(filePath).catch(console.error);
          }
        }).catch(console.error);
      });
    }).catch(console.error);
  });
}, 10 * 60 * 1000); // Run every 10 minutes

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
