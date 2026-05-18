api.controller = function(spUtil, $scope, $window, $timeout) {
  /* widget controller */
  var c = this;
  c.enrollingSession = '';

  c.enroll = function(sessionId) {
    if (!sessionId) return;

    c.enrollingSession = sessionId;
    spUtil.addInfoMessage("Submitting enrollment...");

    c.server.get({
      action: 'enroll',
      session_id: sessionId
    }).then(function(response) {
      c.enrollingSession = '';
      var payload = (response && response.data) || {};
      if (payload.success) {
        spUtil.addTrivialMessage(payload.message || "Enrollment submitted successfully.");
        $timeout(function() {
          $window.location.href = '?id=tocc_my_enrollments';
        }, 900);
        return;
      }

      spUtil.addErrorMessage(payload.message || "Unable to submit enrollment.");
    }, function() {
      c.enrollingSession = '';
      spUtil.addErrorMessage("Unable to submit enrollment.");
    });
  };
};
