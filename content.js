// This script runs on the Google Search Console page
// It can be used to extract information or interact with the page

console.log("Bulk URL Removal Tool content script loaded");

// Example: Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getSearchConsoleInfo") {
    // Example function to get information from the page
    const info = getSearchConsoleInfo();
    sendResponse({info: info});
  }
});

function getSearchConsoleInfo() {
  // This is a placeholder function
  // Implement actual logic to extract relevant information from the page
  return {
    site: document.querySelector('some-selector-for-site-name').textContent,
    // Add other relevant information
  };
}