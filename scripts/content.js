const btnId = 'page-notes-bookmark';
const styles = {
  'position': 'absolute',
  'width': '28px',
  'height': '28px',
  'background-color': '#4a6baf',
  'border-radius': '4px',
  'display': 'flex',
  'justify-content': 'center',
  'align-items': 'center',
  'cursor': 'pointer',
  'z-index': '9999',
  'box-shadow': '0 2px 5px rgba(0, 0, 0, 0.2)',
  'transition': 'transform 0.2s ease',
}

function removeOldButton() {
  let existingButton = document.getElementById(btnId);

  if (existingButton) {
    existingButton.remove();
  }
}

function createBookmarkButton() {
  removeOldButton();

  const button = document.createElement('div');
  button.id = btnId;
  button.style.cssText = Object.entries(styles).map(([key, value]) => `${key}: ${value}`).join(';');

  button.onmouseover = function() {
    this.style.transform = 'scale(1.1)';
  };

  button.onmouseout = function() {
    this.style.transform = 'scale(1)';
  };

  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  return button;
}

function getSelectionPosition() {
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    return {
      left: rect.left + window.scrollX + rect.width,
      top: rect.top + window.scrollY
    };
  }

  return null;
}


function saveNote(selectedText) {
  const position = getSelectionPosition();

  if (!position) return;

  const currentUrl = window.location.href;

  const newNote = {
    position: {
      left: position.left,
      top: position.top
    },
    text: selectedText,
    timestamp: Date.now()
  };

  let savedData = localStorage.getItem('pageNotes');
  let allNotes = savedData ? JSON.parse(savedData) : [];

  let urlEntry = allNotes.find(entry => entry.url === currentUrl);

  if (urlEntry) {
    urlEntry.notes.push(newNote);
  } else {
    urlEntry = {
      url: currentUrl,
      title: document.title,
      notes: [newNote]
    };
    allNotes.push(urlEntry);
  }

  localStorage.setItem('pageNotes', JSON.stringify(allNotes));
}

document.addEventListener('mouseup', function(e) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText && e.target.id !== btnId) {
    const position = getSelectionPosition();

    if (position) {
      const button = createBookmarkButton();

      button.style.left = `${position.left + 5}px`;
      button.style.top = `${position.top - 20}px`;

      console.log('перед назначением');
      button.addEventListener('click', function() {
        console.log('сам клик');
        saveNote(selectedText);
        this.remove();
      });

      document.body.appendChild(button);
    }
  } else if (!selectedText || (e.target.id !== btnId && !e.target.closest(`#${btnId}`))) {
    const button = document.getElementById(btnId);

    if (button) {
      button.remove();
    }
  }
});

const style = document.createElement('style');
style.textContent = `
  #${btnId} {
    animation: pageNotesFadeIn 0.3s ease-in-out;
  }

  @keyframes pageNotesFadeIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(style);