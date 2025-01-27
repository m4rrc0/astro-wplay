const areas = Array.from(document.forms['organizationsForm'].elements.areas).reduce(
  (result, a) => ({ ...result, [a.dataset.code]: a.dataset.label }),
  {}
)
const organizationTypes = Array.from(document.forms['organizationsForm'].elements.types).reduce(
  (result, t) => ({ ...result, [t.dataset.code]: t.dataset.label }),
  {}
)
const services = Array.from(document.forms['organizationsForm'].elements.services).reduce(
  (result, t) => ({ ...result, [t.dataset.code]: t.dataset.label }),
  {}
)
const organizationsForm = document.getElementById('organizationsForm')
const resetBtn = document.getElementById('resetBtn')
const areaBtn = document.getElementById('areaBtn')
const typeBtn = document.getElementById('organizationTypeBtn')
const serviceBtn = document.getElementById('serviceBtn')
const organizations = document.getElementsByClassName('card-organization')
const dropdowns = document.getElementsByClassName('dropdown-content')

// Update form inputs with URL parameters
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
if (urlParams.size > 0) {
  const form = document.forms['organizationsForm']
  for (const param of urlParams) {
    if (param[0] === 'areas') {
      for (const area in form.elements[param[0]]) {
        if (form.elements[param[0]][area].id === param[1]) {
          form.elements[param[0]][area].checked = true
        }
      }
    } else {
      for (const paramFilter in document.forms['organizationsForm'].elements[param[0]]) {
        if (document.forms['organizationsForm'].elements[param[0]][paramFilter].id === param[1]) {
          document.forms['organizationsForm'].elements[param[0]][paramFilter].checked = true
        }
      }
    }
    {
      form.elements[param[0]].value = param[1]
    }
  }
  filterOrganizations(organizationsForm)
}

/**
 * Filter organizations in organizations page using the parameters in the form
 * @param {*} organizationsForm
 */
function filterOrganizations(organizationsForm) {
  // Get the data from the form
  const data = new FormData(organizationsForm)
  const filterParams = Array.from(data.entries())
  const areasFilter = filterParams.filter(([key]) => key === 'areas').map(([, value]) => value)
  const typesFilter = filterParams.filter(([key]) => key === 'types').map(([, value]) => value)
  const servicesFilter = filterParams
    .filter(([key]) => key === 'services')
    .map(([, value]) => value)

  // Update the current page URL
  window.history.replaceState(
    null,
    null,
    filterParams.reduce((queryString, param, index) => {
      if (!param[1]) {
        return queryString
      }
      return (
        queryString + param[0] + '=' + param[1] + (index === filterParams.length - 1 ? '' : '&')
      )
    }, '?')
  )

  // Update the reset button display
  if (
    (!!areasFilter && areasFilter.length) ||
    (!!typesFilter && typesFilter.length) ||
    (!!servicesFilter && servicesFilter.length)
  ) {
    resetBtn.style.display = 'initial'
  } else {
    resetBtn.style.display = 'none'
  }

  // Update the areas button
  if (!!areasFilter && areasFilter.length) {
    areaBtn.classList.add('color-palette-teal')
    areaBtn.children[0].innerText = areasFilter.map(areaFilter => areas[areaFilter]).join(', ')
  } else {
    areaBtn.classList.remove('color-palette-teal')
    areaBtn.children[0].innerText = 'Provinces'
  }

  // Update the types button
  if (!!typesFilter && typesFilter.length) {
    typeBtn.classList.add('color-palette-teal')
    typeBtn.children[0].innerText = typesFilter
      .map(typeFilter => organizationTypes[typeFilter])
      .join(', ')
  } else {
    typeBtn.classList.remove('color-palette-teal')
    typeBtn.children[0].innerText = 'Types'
  }

  // Update the services button
  if (!!servicesFilter && servicesFilter.length) {
    serviceBtn.classList.add('color-palette-teal')
    serviceBtn.children[0].innerText = servicesFilter
      .map(serviceFilter => services[serviceFilter])
      .join(', ')
  } else {
    serviceBtn.classList.remove('color-palette-teal')
    serviceBtn.children[0].innerText = 'Services'
  }

  // Filter the organizations
  for (let i = 0; i < organizations.length; i++) {
    if (
      (areasFilter &&
        areasFilter.length &&
        (areasFilter.length > 1 || areasFilter[0] !== '') &&
        !areasFilter.some(area => {
          if (organizations[i].dataset.area) {
            return organizations[i].dataset.area === area
          }
          return false
        })) ||
      (typesFilter &&
        typesFilter.length &&
        (typesFilter.length > 1 || typesFilter[0] !== '') &&
        !typesFilter.some(organizationType => {
          if (organizations[i].dataset.types) {
            return organizations[i].dataset.types.includes(organizationType)
          }
          return false
        })) ||
      (servicesFilter &&
        servicesFilter.length &&
        (servicesFilter.length > 1 || servicesFilter[0] !== '') &&
        !servicesFilter.some(service => {
          if (organizations[i].dataset.services) {
            return organizations[i].dataset.services.includes(service)
          }
          return false
        }))
    ) {
      organizations[i].style.display = 'none'
    } else {
      organizations[i].style.display = 'initial'
    }
  }
}

organizationsForm.onsubmit = e => e.preventDefault()
organizationsForm.onchange = () => filterOrganizations(organizationsForm)
resetBtn.onclick = e => {
  e.preventDefault()
  organizationsForm.reset()
  filterOrganizations(organizationsForm)
}
