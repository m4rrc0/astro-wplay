const areas = Array.from(document.forms['organizationsForm'].elements.areas).reduce(
  (result, a) => ({ ...result, [a.dataset.code]: a.dataset.label}), {}
)
const organizationTypes = Array.from(document.forms['organizationsForm'].elements.types).reduce(
  (result, t) => ({ ...result, [t.dataset.code]: t.dataset.label}), {}
)
const organizationsForm = document.getElementById('organizationsForm');
const resetBtn = document.getElementById('resetBtn');
const areaBtn = document.getElementById('areaBtn');
const typeBtn = document.getElementById('typeBtn');
const organizations = document.getElementsByClassName('card-organization');
const dropdowns = document.getElementsByClassName('dropdown-content');

// Update form inputs with URL parameters
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.size > 0) {
  const form = document.forms['organizationsForm'];
  for (const param of urlParams) {
    if (param[0] === 'areas') {
      for (const area in form.elements[param[0]]) {
        if (form.elements[param[0]][area].id === param[1]) {
          form.elements[param[0]][area].checked = true;
        }
      }
    } else if (param[0] === 'types') {
      for (const organizationType in document.forms['organizationsForm'].elements[param[0]]) {
        if (document.forms['organizationsForm'].elements[param[0]][organizationType].id === param[1]) {
          document.forms['organizationsForm'].elements[param[0]][organizationType].checked = true;
        }
      }
    } {
      form.elements[param[0]].value = param[1];
    }
  }
  filterOrganizations(organizationsForm);
}

/**
 * Filter organizations in organizations page using the parameters in the form
 * @param {*} organizationsForm 
 */
function filterOrganizations(organizationsForm) {
  // Get the data from the form
  const data = new FormData(organizationsForm);
  const filterParams = Array.from(data.entries());
  const areasFilter = filterParams.filter(([key,]) => key === 'areas').map(([,value]) => value);
  const typesFilter = filterParams.filter(([key,]) => key === 'types').map(([,value]) => value);
  
  // Update the current page URL
  window.history.replaceState(null, null, filterParams.reduce(
    (queryString, param, index) => {
      if (!param[1]) {
        return queryString;
      }
      return queryString + param[0] + "=" + param[1] + (index === filterParams.length - 1 ? "" : "&")
    },
    "?"
  ));

  // Update the reset button display
  if ((!!areasFilter && areasFilter.length) || (!!typesFilter && typesFilter.length)) {
    resetBtn.style.display = 'initial';
  } else {
    resetBtn.style.display = 'none';
  }

  // Update the areas button
  if (!!areasFilter && areasFilter.length) {
    areaBtn.classList.add('color-palette-teal');
    areaBtn.innerText = areasFilter.map(areaFilter => areas[areaFilter]).join(', ');
  } else {
    areaBtn.classList.remove('color-palette-teal');
    areaBtn.innerText = 'Provinces';
  }

  // Update the types button
  if (!!typesFilter && typesFilter.length) {
    typeBtn.classList.add('color-palette-teal');
    typeBtn.innerText = typesFilter.map(typeFilter => organizationTypes[typeFilter]).join(', ');
  } else {
    typeBtn.classList.remove('color-palette-teal');
    typeBtn.innerText = 'Types';
  }

  // Filter the organizations
  for (let i = 0; i < organizations.length; i++) {
    if (
      (areasFilter && areasFilter.length && (areasFilter.length > 1 || areasFilter[0] !== '') && !areasFilter.some(area => {
        if (organizations[i].dataset.area) {
          return organizations[i].dataset.area === area;
        }
        return false;
      })) ||
      (typesFilter && typesFilter.length && (typesFilter.length > 1 || typesFilter[0] !== '') && !typesFilter.some(organizationType => {
        if (organizations[i].dataset.types) {
          return organizations[i].dataset.types.includes(organizationType);
        }
        return false;
      }))
    ) {
      organizations[i].style.display = 'none';
    } else {
      organizations[i].style.display = 'initial';
    }
  }
};

/**
 * Close the dropdown menu if the user clicks outside of it
 * @param {*} e 
 */
function closeDropdowns(e) {
  if (!e.target.closest('.dropdown')) {
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};

organizationsForm.onsubmit = (e) => e.preventDefault();
organizationsForm.onchange = () => filterOrganizations(organizationsForm);
resetBtn.onclick = (e) => {
  e.preventDefault();
  organizationsForm.reset();
  filterOrganizations(organizationsForm);
};

window.onclick = closeDropdowns;