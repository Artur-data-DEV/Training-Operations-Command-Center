api.controller = function(spUtil, $scope, $window, $timeout) {
  /* widget controller */
  var c = this;

  c.enroll = function(sessionId) {
    if (!sessionId) return;
    
    // We would normally use GlideAjax here to call PortalApiService.enroll()
    // For now, let's redirect to the enrollment page or show a confirmation
    spUtil.addInfoMessage("Processing enrollment for session...");
    
    // In a real scenario, we'd call the server:
    /*
    c.server.get({
      action: 'enroll',
      session_id: sessionId
    }).then(function(response) {
      if (response.data.success) {
        spUtil.addTrivialMessage("Enrollment successful!");
        $timeout(function() {
          $window.location.href = '?id=tocc_my_enrollments';
        }, 1000);
      }
    });
    */
    
    // Mocking success for the demo look
    $timeout(function() {
      $window.location.href = '?id=tocc_my_enrollments';
    }, 1500);
  };
};
