const btnId = 'page-notes-bookmark';
const listId = 'page-notes-list';
const closeNotesListBtnId = 'close-notes-list';

const noteDeleteBtnClass = 'note-delete-btn';
const notesContainerClass = 'notes-container';

const storageId = 'page-notes';

const btnStyles = {
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
  'pointer-events': 'auto'
};
const bookmarkListStyles = {
  'position': 'fixed',
  'top': '20px',
  'right': '20px',
  'z-index': '9998',
  'width': '300px',
  'max-height': '400px',
  'background-color': '#f5f7fa',
  'border-radius': '8px',
  'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
  'overflow': 'hidden',
  'color': '#333',
  'display': 'flex',
  'flex-direction': 'column',
  'animation': 'pageNotesSlideIn 0.3s ease-out'
};
const noteElementStyles = {
  'padding': '12px 16px',
  'border-bottom': '1px solid #e1e5ea',
  'background-color': 'white',
  'cursor': 'pointer',
  'transition': 'background-color 0.2s'
};
const headerBookmarkListStyles = {
  'background-color': '#4a6baf',
  'color': 'white',
  'padding': '16px',
  'border-radius': '8px 8px 0 0',
  'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.1)',
  'display': 'flex',
  'justify-content': 'space-between',
  'align-items': 'center'
};
const notesContainerStyles = {
  'overflow-y': 'auto',
  'max-height': '300px',
  'padding': '0'
};

const btnIcon = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
`;
const deleteIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z" />
  </svg>
`;

/**
  Сервисные функции
*/
function getCSSText(styles) {
  return Object.entries(styles).map(([key, value]) => `${key}: ${value}`).join(';');
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

/**
  Функционал кнопки закладки
*/
function removeOldButton() {
  let existingButton = document.getElementById(btnId);

  if (existingButton) {
    existingButton.remove();
  }
}

function createBookmarkButton(selectedText) {
  removeOldButton();

  const button = document.createElement('div');
  button.id = btnId;
  button.style.cssText = getCSSText(btnStyles);

  button.onmouseover = function() {
    this.style.transform = 'scale(1.1)';
  };

  button.onmouseout = function() {
    this.style.transform = 'scale(1)';
  };

  button.innerHTML = btnIcon;

  button.onclick = function(e) {
    e.stopPropagation();

    saveNote(selectedText);
    this.remove();

    displayBookmarksList();

    return false;
  };

  return button;
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

  let savedData = localStorage.getItem(storageId);
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

  localStorage.setItem(storageId, JSON.stringify(allNotes));
}

/**
 * Функционал элементов закладок
 */
function createNoteItemHTML(note) {
  const displayText = note.text.length > 70 ? note.text.substring(0, 70) + '...' : note.text;

  return `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 14px; line-height: 1.4; margin-bottom: 4px; word-break: break-word;">${displayText}</div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <button class="${noteDeleteBtnClass}" data-timestamp="${note.timestamp}" style="
          background-color: transparent;
          border: none;
          color: #ff5252;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          opacity: 0.7;
          transition: opacity 0.2s;
        ">${deleteIcon}</button>
      </div>
    </div>
  `;
}

function createNoteItem(note) {
  const noteElement = document.createElement('div');

  noteElement.style.cssText = getCSSText(noteElementStyles);
  noteElement.innerHTML = createNoteItemHTML(note);

  noteElement.onmouseover = function() {
    this.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
  };

  noteElement.onmouseout = function() {
    this.style.backgroundColor = 'white';
  };

  noteElement.querySelector(`.${noteDeleteBtnClass}`).onmouseover = function(e) {
    e.stopPropagation();

    this.style.opacity = '1';
    this.style.color = '#ff0000';
  };

  noteElement.querySelector(`.${noteDeleteBtnClass}`).onmouseout = function(e) {
    e.stopPropagation();

    this.style.opacity = '0.7';
    this.style.color = '#ff5252';
  };

  noteElement.addEventListener('click', function(e) {
    if (e.target.className === noteDeleteBtnClass) return;

    window.scrollTo({
      top: note.position.top - 100,
      behavior: 'smooth'
    });

    highlightTextOnPage(note.text, note.position);
  });

  // Функция для поиска и выделения текста на странице
  function highlightTextOnPage(text, position) {
    // экранирование спецсимволов для поиска
    const searchText = text.trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (!searchText) return;

    // TreeWalker для обхода текстовых узлов страницы
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    let foundNode = null;
    let minDistance = Infinity;

    // Находим ближайший к указанной позиции текстовый узел, содержащий искомый текст
    while (node = walker.nextNode()) {
      // Пропускаем узлы внутри наших элементов
      if (node.parentElement.closest(`#${listId}`) || node.parentElement.closest(`#${btnId}`)) {
        continue;
      }

      const content = node.textContent;
      if (content.includes(searchText) || content.includes(text.substring(0, 20))) {
        // Проверяем расстояние от позиции заметки до узла
        const range = document.createRange();
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();

        const distance = Math.sqrt(
          Math.pow(position.left - (rect.left + window.scrollX), 2) +
          Math.pow(position.top - (rect.top + window.scrollY), 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          foundNode = node;
        }
      }
    }

    if (foundNode) {
      // Создаем диапазон для выделения
      const range = document.createRange();
      const content = foundNode.textContent;

      // Находим индекс начала и конца искомого текста
      let startIndex = content.indexOf(searchText);
      if (startIndex === -1) {
        startIndex = content.indexOf(text.substring(0, 20));
      }

      if (startIndex !== -1) {
        const endIndex = startIndex + Math.min(searchText.length, 50);

        range.setStart(foundNode, startIndex);
        range.setEnd(foundNode, endIndex);

        // Создаем выделение
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Добавляем фоновую подсветку
        const highlight = document.createElement('span');
        highlight.className = 'page-notes-highlight';
        highlight.style.cssText = `
          background-color: rgba(255, 235, 59, 0.5);
          transition: background-color 0.5s;
        `;

        try {
          range.surroundContents(highlight);

          // Анимируем подсветку
          setTimeout(() => {
            highlight.style.backgroundColor = 'rgba(255, 235, 59, 0.2)';
          }, 1000);

          // Удаляем подсветку через 5 секунд, восстанавливая исходный текст
          setTimeout(() => {
            const parent = highlight.parentNode;
            if (parent) {
              const textNode = document.createTextNode(highlight.textContent);
              parent.replaceChild(textNode, highlight);
            }
          }, 5000);
        } catch (e) {
          console.log("Ошибка при создании подсветки:", e);
        }
      }
    }
  }

  noteElement.querySelector(`.${noteDeleteBtnClass}`).addEventListener('click', function(e) {
    e.stopPropagation();

    const timestamp = parseInt(this.getAttribute('data-timestamp'));
    deleteNote(timestamp);
    noteElement.remove();

    const bookmarksList = document.getElementById(listId);
    const notesContainer = bookmarksList.querySelector(`.${notesContainerClass}`);

    if (notesContainer.children.length === 0) {
      bookmarksList.remove();
    }
  });

  return noteElement;
}

function deleteNote(timestamp) {
  const currentUrl = window.location.href;
  let savedData = localStorage.getItem(storageId);

  if (!savedData) return;

  let allNotes = JSON.parse(savedData);
  let urlEntry = allNotes.find(entry => entry.url === currentUrl);

  if (!urlEntry) return;

  urlEntry.notes = urlEntry.notes.filter(note => note.timestamp !== timestamp);

  if (urlEntry.notes.length === 0) {
    allNotes = allNotes.filter(entry => entry.url !== currentUrl);
  }

  localStorage.setItem(storageId, JSON.stringify(allNotes));
}

/**
 * Функционал таблички с закладками
 */
function removeOldList() {
  const existingList = document.getElementById(listId);

  if (existingList) {
    existingList.remove();
  }
}

function getHeaderBookmarkListHTML() {
  return `
    <div>
      <h2 style="margin: 0; font-size: 16px; font-weight: 600;">Заметки на странице</h2>
      <div style="background-color: rgba(255, 255, 255, 0.2); padding: 2px 6px; border-radius: 12px; font-size: 11px; margin-top: 4px; display: inline-block;">
        ${document.title.substring(0, 30)}${document.title.length > 30 ? '...' : ''}
      </div>
    </div>
    <button id="${closeNotesListBtnId}" style="
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0;
      font-size: 18px;
      line-height: 1;
    ">×</button>
  `
}

function createBookmarkList() {
  removeOldList();

  const list = document.createElement('div');
  list.id = listId;
  list.style.cssText = getCSSText(bookmarkListStyles);

  const header = document.createElement('div');
  header.style.cssText = getCSSText(headerBookmarkListStyles);

  header.innerHTML = getHeaderBookmarkListHTML();

  list.appendChild(header);

  const notesContainer = document.createElement('div');
  notesContainer.className = notesContainerClass;
  notesContainer.style.cssText = getCSSText(notesContainerStyles);

  list.appendChild(notesContainer);

  header.querySelector(`#${closeNotesListBtnId}`).addEventListener('click', function() {
    list.remove();
  });

  return list;
}

function displayBookmarksList() {
  const savedData = localStorage.getItem(storageId);
  if (!savedData) return;

  const allNotes = JSON.parse(savedData);
  const currentUrl = window.location.href;
  const urlEntry = allNotes.find(entry => entry.url === currentUrl);

  if (!urlEntry || urlEntry.notes.length === 0) return;

  const bookmarksList = createBookmarkList();
  document.body.appendChild(bookmarksList);

  const notesContainer = bookmarksList.querySelector(`.${notesContainerClass}`);

  urlEntry.notes
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach(note => {
      const noteElement = createNoteItem(note);
      notesContainer.appendChild(noteElement);
    });
}

/**
 * Прочий функционал
 */
document.addEventListener('mouseup', function(e) {
  // Короткая задержка, чтобы дать возможность сработать onclick кнопки
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    // Проверяем, что это не клик по нашим элементам интерфейса
    if (e.target.id === btnId || e.target.closest(`#${btnId}`) ||
        e.target.id === listId || e.target.closest(`#${listId}`)) {
      return;
    }

    if (selectedText) {
      const position = getSelectionPosition();

      if (position) {
        const button = createBookmarkButton(selectedText);

        button.style.left = `${position.left + 5}px`;
        button.style.top = `${position.top - 20}px`;

        document.body.appendChild(button);
      }
    } else {
      const button = document.getElementById(btnId);

      if (button) {
        button.remove();
      }
    }
  }, 10);
});

document.addEventListener('click', function(e) {
  // Если клик не по кнопке и не по списку заметок, удаляем кнопку
  if (e.target.id !== btnId && !e.target.closest(`#${btnId}`) &&
      e.target.id !== listId && !e.target.closest(`#${listId}`)) {
    const button = document.getElementById(btnId);

    if (button) {
      button.remove();
    }
  }
});

const style = document.createElement('style');
style.textContent = `
  .page-notes-highlight {
    background-color: rgba(255, 235, 59, 0.5);
    border-radius: 2px;
    animation: highlightPulse 2s infinite;
  }

  #${btnId} {
    animation: pageNotesFadeIn 0.3s ease-in-out;
  }

  @keyframes pageNotesFadeIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes pageNotesSlideIn {
    from { transform: translateX(30px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes pageNotesPulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.4; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes highlightPulse {
    0% { background-color: rgba(255, 235, 59, 0.5); }
    50% { background-color: rgba(255, 235, 59, 0.2); }
    100% { background-color: rgba(255, 235, 59, 0.5); }
  }
`;
document.head.appendChild(style);

// Отображаем список закладок при загрузке страницы, если они есть
document.addEventListener('DOMContentLoaded', function() {
  displayBookmarksList();
});

// На случай, если страница уже загружена
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  displayBookmarksList();
}