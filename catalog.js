const category = document.querySelector('#category');
const search = document.querySelector('#search');
const grid = document.querySelector('#grid');
const count = document.querySelector('#count');
const empty = document.querySelector('#empty');
const pagination = document.querySelector('#pagination');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const pageLabel = document.querySelector('#page');
const pageSize = 12;
let page = 1;

const groups = [...new Set(products.flatMap(product => product.categories))];
for (const group of groups) category.add(new Option(group, group));

const normalize = value => value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
const entries = products.map(product => ({
  ...product,
  terms: normalize([product.title, ...product.categories].join(' '))
}));

function render() {
  const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
  const matches = entries.filter(product =>
    (!category.value || product.categories.includes(category.value)) &&
    words.every(word => product.terms.includes(word))
  );
  const totalPages = Math.ceil(matches.length / pageSize);
  count.textContent = matches.length === 1 ? '1 producto' : `${matches.length} productos`;
  empty.hidden = matches.length > 0;
  pagination.hidden = totalPages < 2;
  previous.disabled = page === 1;
  next.disabled = page >= totalPages;
  pageLabel.textContent = `${page} / ${totalPages}`;

  grid.replaceChildren(...matches.slice((page - 1) * pageSize, page * pageSize).map(product => {
    const link = document.createElement('a');
    link.className = 'product';
    link.href = product.url;
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = '';
    image.loading = 'lazy';
    const title = document.createElement('h2');
    title.textContent = product.title;
    const visual = document.createElement('div');
    visual.className = product.crop ? `product-visual crop-${product.crop}` : 'product-visual';
    visual.append(image);
    for (const [x, y, width, height, color] of product.masks ?? []) {
      const mask = document.createElement('span');
      mask.className = 'product-mask';
      mask.setAttribute('aria-hidden', 'true');
      Object.assign(mask.style, {
        left: `${x / 3}%`,
        top: `${y / 3}%`,
        width: `${width / 3}%`,
        height: `${height / 3}%`,
        backgroundColor: color
      });
      visual.append(mask);
    }
    const action = document.createElement('span');
    action.className = 'product-action';
    action.textContent = 'Ver ficha ↗';
    link.append(visual, title, action);
    return link;
  }));
}

function resetPage() {
  page = 1;
  render();
}

function movePage(offset) {
  page += offset;
  render();
  search.scrollIntoView({block: 'center'});
}

search.addEventListener('input', resetPage);
category.addEventListener('change', resetPage);
previous.addEventListener('click', () => movePage(-1));
next.addEventListener('click', () => movePage(1));
render();
