
      // Suppress MediaPipe console errors
      const originalError = console.error;
      console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('face_mesh') || message.includes('MediaPipe') || message.includes('buffer')) {
          return; // Suppress MediaPipe errors
        }
        originalError.apply(console, args);
      };
      
      // Suppress unhandled promise rejections from MediaPipe
      window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && (event.reason.message || '').includes('MediaPipe')) {
          event.preventDefault();
        }
      });
    