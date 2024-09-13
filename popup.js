document.addEventListener('DOMContentLoaded', function() {
  const loginButton = document.getElementById('login');
  const logoutButton = document.getElementById('logout');
  const removeUrlsButton = document.getElementById('removeUrls');
  const loginSection = document.getElementById('loginSection');
  const mainSection = document.getElementById('mainSection');
  const statusDiv = document.getElementById('status');
  const messageDiv = document.getElementById('message');

  function updateUI(isLoggedIn) {
    loginSection.style.display = isLoggedIn ? 'none' : 'block';
    mainSection.style.display = isLoggedIn ? 'block' : 'none';
    if (isLoggedIn) {
      showMessage('Logged in successfully!', 'success');
    } else {
      showMessage('Logged out successfully!', 'info');
    }
  }

  function showMessage(text, type = 'info') {
    messageDiv.textContent = text;
    messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#e6f3ff';
    messageDiv.style.color = type === 'success' ? '#155724' : '#004085';
    messageDiv.style.textAlign = 'center'
    messageDiv.style.marginBottom = '10px'
    messageDiv.style.color = '#EA4335'
  }

  chrome.storage.local.get('isLoggedIn', function(data) {
    updateUI(data.isLoggedIn);
  });

  loginButton.addEventListener('click', function() {
    showMessage('Logging in...', 'info');
    chrome.runtime.sendMessage({action: "login"}, function(response) {
      if (response.success) {
        updateUI(true);
        chrome.storage.local.set({isLoggedIn: true});
      } else {
        showMessage("Login failed. Please try again.", 'error');
      }
    });
  });

  logoutButton.addEventListener('click', function() {
    showMessage('Logging out...', 'info');
    chrome.runtime.sendMessage({action: "logout"}, function(response) {
      if (response.success) {
        updateUI(false);
        chrome.storage.local.set({isLoggedIn: false});
      } else {
        showMessage("Logout failed. Please try again.", 'error');
      }
    });
  });

  removeUrlsButton.addEventListener('click', function() {
    const urls = document.getElementById('urlList').value.split('\n').filter(url => url.trim() !== '');
    if (urls.length === 0) {
      showMessage("Please enter at least one URL to remove.", 'error');
      return;
    }
    statusDiv.textContent = "Processing...";
    chrome.runtime.sendMessage({action: "removeUrls", urls: urls}, function(response) {
      statusDiv.textContent = response.message;
    });
  });
});