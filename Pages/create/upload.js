document.getElementById('uploadForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const tags = document.getElementById('tags').value.trim();
  const type = document.getElementById('type').value; // assuming you have a select input with id="type"
  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];
  const status = document.getElementById('uploadStatus');

  // Simulate getting logged in username (replace with your real auth system)
  // For example, from localStorage or a global variable
  const uploader = localStorage.getItem('loggedInUser') || null;

  // Validation checks
  if (!title) {
    status.textContent = 'Title is required.';
    status.style.color = 'red';
    return;
  }
  if (!tags) {
    status.textContent = 'At least one tag is required.';
    status.style.color = 'red';
    return;
  }
  if (!type || type === "") {
    status.textContent = 'Please select the type of animal (cat, dog, or fox).';
    status.style.color = 'red';
    return;
  }
  if (!file) {
    status.textContent = 'Please select an image file to upload.';
    status.style.color = 'red';
    return;
  }
  if (!uploader) {
    status.textContent = 'You must be logged in to upload an image.';
    status.style.color = 'red';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    posts.unshift({
      title,
      tags,
      type,
      uploader,
      image: reader.result,
      timestamp: Date.now()
    });

    localStorage.setItem('posts', JSON.stringify(posts));
    status.textContent = '✅ Image uploaded successfully!';
    status.style.color = '#2e7d32';

    setTimeout(() => {
      document.getElementById('uploadForm').reset();
      status.textContent = '';
    }, 2000);
  };

  reader.readAsDataURL(file);
});


