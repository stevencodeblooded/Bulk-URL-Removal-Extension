const MOCK_MODE = true; // Set this to false when you have a real domain to test with

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "login") {
    chrome.identity.getAuthToken({interactive: true}, function(token) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        sendResponse({success: false, message: "Login failed. Please try again."});
      } else {
        chrome.storage.local.set({accessToken: token}, function() {
          console.log("Access token saved:", token);
          sendResponse({success: true, message: "Logged in successfully!"});
        });
      }
    });
    return true;
  } else if (request.action === "logout") {
    chrome.storage.local.get(['accessToken'], function(result) {
      if (result.accessToken) {
        chrome.identity.removeCachedAuthToken({token: result.accessToken}, function() {
          chrome.storage.local.remove('accessToken', function() {
            sendResponse({success: true, message: "Logged out successfully!"});
          });
        });
      } else {
        sendResponse({success: true, message: "Already logged out."});
      }
    });
    return true;
  } else if (request.action === "removeUrls") {
    chrome.storage.local.get(['accessToken'], function(result) {
      if (!result.accessToken) {
        sendResponse({success: false, message: "Not logged in. Please login first."});
        return;
      }
      if (MOCK_MODE) {
        mockRemoveUrls(request.urls)
          .then(result => sendResponse({success: true, message: result}))
          .catch(error => sendResponse({success: false, message: "Error: " + error.message}));
      } else {
        removeUrls(request.urls, result.accessToken)
          .then(result => sendResponse({success: true, message: result}))
          .catch(error => sendResponse({success: false, message: "Error: " + error.message}));
      }
    });
    return true;
  }
});

async function mockRemoveUrls(urls) {
  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate some successes and failures
  const successCount = Math.floor(urls.length * 0.8);  // 80% success rate
  const failCount = urls.length - successCount;
  
  return `Successfully removed ${successCount} URLs. Failed to remove ${failCount} URLs.`;
}

async function removeUrls(urls, accessToken) {
  const baseUrl = "https://www.googleapis.com/webmasters/v3/sites/";
  const site = encodeURIComponent("sc-domain:example.com"); // Replace with actual site when not in mock mode
  let successCount = 0;
  let failCount = 0;

  for (const url of urls) {
    try {
      const response = await fetch(`${baseUrl}${site}/urlNotifications/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          type: "URL_REMOVED"
        })
      });

      if (response.ok) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.error("Error removing URL:", url, error);
      failCount++;
    }
  }

  return `Successfully removed ${successCount} URLs. Failed to remove ${failCount} URLs.`;
}