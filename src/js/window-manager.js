

function addIframeOverlays() {
  $('iframe').each(function() {
    var $iframe = $(this);
    var $overlay = $('<div class="manual-iframe-overlay"></div>')
      .css({
        position: 'absolute',
        left: $iframe.offset().left,
        top: $iframe.offset().top,
        width: $iframe.outerWidth(),
        height: $iframe.outerHeight(),
        background: 'transparent',
        zIndex: 1001,  // Above most content
        pointerEvents: 'auto'  // Let events pass through if needed
      });
    $overlay.data('iframe', $iframe);  // Link back for cleanup
    $('body').append($overlay);
  });
}

function removeIframeOverlays() {
  $('.manual-iframe-overlay').remove();
}


// Windows 95 style window manager using jQuery UI
window.toggleEditorWindow = function(active) {
  if (active) {
    const win = $('#cube-3d-window');
    const content = $('#cube-3d-content');
    const wrapper = $('#cube-3d-wrapper');
    
    if (!win.length || !content.length || !wrapper.length) return;
    
    $('body').addClass('editor-active');
    content.append(wrapper);
    
    win.css({ left: '50px', top: '50px' });
    
    win.draggable({
      handle: '#cube-3d-titlebar',
      start: addIframeOverlays,
      stop: removeIframeOverlays,
    });
    
    win.resizable({
      handles: 'n, e, s, w, ne, se, sw, nw',
      minWidth: 200,
      minHeight: 200,
      start: addIframeOverlays,
      stop: removeIframeOverlays,
    });

    $(document).on('mousedown touchstart',(ev)=>{
      if (ev.target.id === 'cube-3d-wrapper') {
        window.cameraRotationEnabled = true;
        return;
      }
      window.cameraRotationEnabled = false;
    })

  } else {
    const win = $('#cube-3d-window');
    const wrapper = $('#cube-3d-wrapper');
    const originalParent = $('#right-panel');
    
    $('body').removeClass('editor-active');
    originalParent.append(wrapper);
    wrapper.css({ width: '', height: '' });
    
    if (win.draggable('instance')) win.draggable('destroy');
    if (win.resizable('instance')) win.resizable('destroy');
    win.off('mousedown');
  }
};