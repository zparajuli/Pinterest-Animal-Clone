let fetching = false;
let searchActive = false;

const container = document.getElementById('container');
const cols = Array.from(container.getElementsByClassName('col'));
const loader = document.getElementById('loader');
const popup = document.getElementById('imagePopup');

// Create popup content container and download button once
const popupContent = document.createElement('div');
popupContent.classList.add('popup-content');

const popupDownloadBtn = document.createElement('button');
popupDownloadBtn.id = 'popupDownloadBtn';
// Font Awesome download icon inside button
popupDownloadBtn.innerHTML = '<i class="fas fa-download"></i>';
popupDownloadBtn.setAttribute('aria-label', 'Download Image');

// Clear popup and add popupContent div
popup.innerHTML = '';
popup.appendChild(popupContent);

// Add image and download button inside popupContent
popupContent.appendChild(popupDownloadBtn);

const popupImg = document.createElement('img');
popupImg.alt = "Popup Image";
// Insert image before the download button inside popupContent
popupContent.insertBefore(popupImg, popupDownloadBtn);

const CAT_API_KEY = ''; // Add your Cat API key here if you have one

if (!CAT_API_KEY) console.warn('No Cat API key provided. Cat images may not load.');

const fetchCatImages = async (count = 10) => {
  try {
    const response = await fetch(`https://api.thecatapi.com/v1/images/search?limit=${count}`, {
      headers: {
        'x-api-key': CAT_API_KEY
      }
    });
    const data = await response.json();
    return data.map(item => item.url);
  } catch (error) {
    console.error("Error fetching cat images:", error);
    return [];
  }
};

const fetchDogImages = async (count = 10) => {
  try {
    const response = await fetch(`https://dog.ceo/api/breeds/image/random/${count}`);
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error("Error fetching dog images:", error);
    return [];
  }
};

const fetchFoxImages = async (count = 5) => {
  const urls = [];
  try {
    for (let i = 0; i < count; i++) {
      const response = await fetch('https://randomfox.ca/floof/');
      const data = await response.json();
      urls.push(data.image);
    }
  } catch (error) {
    console.error("Error fetching fox images:", error);
  }
  return urls;
};

const fetchMixedImages = async () => {
  fetching = true;
  loader.style.display = 'block';

  try {
    const [cats, dogs, foxes] = await Promise.all([
      fetchCatImages(),
      fetchDogImages(),
      fetchFoxImages(5),
    ]);

    const allImages = [...cats, ...dogs, ...foxes];
    return allImages.sort(() => Math.random() - 0.5);
  } finally {
    fetching = false;
    loader.style.display = 'none';
  }
};

// Show popup image + download button on card image click
function showPopup(imageUrl, metadata = {}) {
  popupImg.src = imageUrl;
  popupImg.alt = metadata.title || 'Animal Image';
  popup.classList.remove('hidden');  // Show the popup

  // Setup download button click handler
  popupDownloadBtn.onclick = (e) => {
    e.stopPropagation();  // Prevent the popup from closing when clicking the button

    // Create a link element for the download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = (metadata.title ? metadata.title.replace(/\s+/g, '_') : 'downloaded_image') + '.jpg';
    
    // Trigger download by simulating a click on the link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);  // Remove the link after clicking
  };
}

const createCard = (imageUrl, col, metadata = {}) => {
  const card = document.createElement('div');
  card.classList.add('card');

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = metadata.title || "Photo of an animal";

  img.onerror = function () {
    this.src = 'https://via.placeholder.com/300x200?text=Image+Error';
  };

  img.addEventListener('click', () => {
    showPopup(imageUrl, metadata);
  });

  card.appendChild(img);

  if (metadata.title || metadata.uploader) {
    const caption = document.createElement('div');
    caption.innerHTML = `
      <strong>${metadata.title || ''}</strong><br/>
      <small>By ${metadata.uploader || 'anonymous'}</small>
    `;
    card.appendChild(caption);
  }

  col.appendChild(card);
};

const fetchUserPosts = () => {
  const posts = JSON.parse(localStorage.getItem('posts') || '[]');
  return posts;
};

const clearImages = () => {
  cols.forEach(col => col.innerHTML = '');
};

let loadedCount = 0;
const batchSize = 20;

const loadImages = async (append = false) => {
  if (fetching) return;
  fetching = true;
  loader.style.display = 'block';

  if (!append) {
    loadedCount = 0; // reset on initial load
    clearImages();
  }

  try {
    // Fetch user posts once or all? (depends on how you want pagination)
    const userPosts = fetchUserPosts();

    // Select next batch of user posts to show
    const nextUserPosts = userPosts.slice(loadedCount, loadedCount + batchSize);
    nextUserPosts.forEach((post, index) => {
      createCard(post.image, cols[(loadedCount + index) % cols.length], post);
    });

    // Fetch next batch of API images if needed
    const needed = batchSize - nextUserPosts.length;
    if (needed > 0) {
      const fetchedImages = await fetchMixedImages(needed);
      fetchedImages.forEach((img, i) => {
        createCard(img, cols[(loadedCount + nextUserPosts.length + i) % cols.length]);
      });
    }

    loadedCount += batchSize;
  } catch (e) {
    console.error("Error loading images:", e);
  } finally {
    fetching = false;
    loader.style.display = 'none';
  }
};


const handleSearch = async (manualQuery = null) => {
  const query = (manualQuery || document.getElementById('searchInput').value.trim().toLowerCase());
  if (!query || fetching) {
    alert("Please enter a valid search term or wait for current loading to finish.");
    return;
  }

  history.pushState({ search: query }, '', `#${query}`);
  fetching = true;
  loader.style.display = 'block';
  clearImages();

  try {
    searchActive = true;
    if (query === 'dog') {
      const dogs = await fetchDogImages(50);
      dogs.forEach((img, i) => createCard(img, cols[i % cols.length]));
    } else if (query === 'cat') {
      const cats = await fetchCatImages(50);
      cats.forEach((img, i) => createCard(img, cols[i % cols.length]));
    } else if (query === 'fox') {
      const foxes = await fetchFoxImages(30);
      foxes.forEach((img, i) => createCard(img, cols[i % cols.length]));
    } else if (query === 'all') {
      searchActive = false;
      await loadImages();
    } else {
      const terms = query.split('+').map(term => term.trim());
      const allPosts = fetchUserPosts();
      const filtered = allPosts.filter(post => {
        return terms.every(term => {
          return (
            (post.title && post.title.toLowerCase().includes(term)) ||
            (post.tags && post.tags.toLowerCase().includes(term)) ||
            (post.type && post.type.toLowerCase().includes(term)) ||
            (post.uploader && post.uploader.toLowerCase().includes(term))
          );
        });
      });

      if (filtered.length === 0) {
        alert('No results found for your search.');
      } else {
        filtered.forEach((post, i) => {
          createCard(post.image, cols[i % cols.length], post);
        });
      }
    }
  } catch (error) {
    console.error("Search error:", error);
  } finally {
    fetching = false;
    loader.style.display = 'none';
  }
};

window.addEventListener('popstate', async (event) => {
  clearImages();
  const state = event.state;

  if (!state || state.search === 'all') {
    searchActive = false;
    await loadImages();
  } else {
    document.getElementById('searchInput').value = state.search;
    await handleSearch(state.search);
  }
});

window.addEventListener('scroll', () => {
  if (fetching || searchActive) return;

  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  if (docHeight - scrollTop - windowHeight < 800) {
    loadImages(true); // append new batch
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('credit-banner');
  const btnOk = document.getElementById('credit-ok');
  const btnCancel = document.getElementById('credit-cancel');

  if (!localStorage.getItem('creditDismissed')) {
    banner.style.display = 'flex';
    document.body.style.paddingTop = banner.offsetHeight + 'px';
  }

  const dismiss = () => {
    banner.style.display = 'none';
    localStorage.setItem('creditDismissed', 'true');
    document.body.style.paddingTop = '0';
  };

  btnOk.addEventListener('click', dismiss);
  btnCancel.addEventListener('click', dismiss);

  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchButton');

  button.addEventListener('click', () => handleSearch());
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  const homeLink = document.querySelector('a.active');
  if (homeLink) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState({ search: 'all' }, '', '#');
      searchActive = false;
      clearImages();
      loadImages();
    });
  }

  loadImages();
});

// Close popup when clicking outside the image or download button
popup.addEventListener('click', (e) => {
  if (e.target === popup) {
    popup.classList.add('hidden');
    popupImg.src = '';
  }
});
