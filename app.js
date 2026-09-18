const state = { skills: [], category: '全部', query: '' };

const $ = (selector) => document.querySelector(selector);

function renderFilters() {
  const categories = ['全部', ...new Set(state.skills.map((skill) => skill.category))];
  $('#filters').innerHTML = categories.map((category) => `<button class="filter ${category === state.category ? 'active' : ''}" data-category="${category}">${category}</button>`).join('');
  document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
    state.category = button.dataset.category;
    renderFilters();
    renderCards();
  }));
}

function renderCards() {
  const query = state.query.trim().toLowerCase();
  const visible = state.skills.filter((skill) => {
    const matchesCategory = state.category === '全部' || skill.category === state.category;
    const haystack = [skill.name, skill.summary, skill.best_for, skill.outputs, skill.task, skill.prerequisites, ...skill.tags].join(' ').toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
  $('#cards').innerHTML = visible.length ? visible.map((skill) => `
    <article class="card">
      <div class="card-top"><span><span class="category">${skill.category}</span><span class="subcategory">${skill.subcategory}</span></span><a class="external" href="${skill.url}" target="_blank" rel="noreferrer" aria-label="打开 ${skill.name}">↗</a></div>
      <h3>${skill.name}</h3><p>${skill.summary}</p>
      <div class="tags">${skill.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
      <div class="card-bottom"><div><strong>任务：</strong>${skill.task}</div><div><strong>适合：</strong>${skill.best_for}</div><div><strong>前置：</strong>${skill.prerequisites}</div><div><strong>产出：</strong>${skill.outputs}</div><div class="risk"><strong>边界：</strong>${skill.risk}</div><div style="margin-top:10px">${skill.evidence.map((item) => `<span class="badge">${item}</span>`).join('')}</div></div>
    </article>`).join('') : '<p>没有找到匹配项目。可以换一个任务词或切换分类。</p>';
}

function renderTaxonomy(taxonomy) {
  $('#category-count').textContent = taxonomy.length;
  $('#taxonomy-grid').innerHTML = taxonomy.map((item) => `<button class="taxonomy-card" data-category="${item.name}"><span class="taxonomy-name">${item.name}</span><span class="taxonomy-description">${item.description}</span><span class="taxonomy-subcategories">${item.subcategories.join(' · ')}</span></button>`).join('');
  document.querySelectorAll('.taxonomy-card').forEach((button) => button.addEventListener('click', () => {
    state.category = button.dataset.category;
    renderFilters();
    renderCards();
    $('#cards').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

$('#search').addEventListener('input', (event) => { state.query = event.target.value; renderCards(); });
document.querySelectorAll('.workflow-list button').forEach((button) => button.addEventListener('click', () => {
  $('#search').value = button.dataset.query;
  state.query = button.dataset.query;
  renderCards();
  $('#cards').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));
fetch('catalog/skills.json').then((response) => response.json()).then((skills) => {
  state.skills = skills;
  $('#skill-count').textContent = skills.length;
  $('#category-count').textContent = new Set(skills.map((skill) => skill.category)).size;
  renderFilters();
  renderCards();
}).catch(() => { $('#cards').innerHTML = '<p>本地数据加载失败。请通过本地 HTTP 服务预览项目。</p>'; });
fetch('catalog/taxonomy.json').then((response) => response.json()).then(renderTaxonomy).catch(() => { $('#taxonomy-grid').innerHTML = '<p>分类地图加载失败。</p>'; });
