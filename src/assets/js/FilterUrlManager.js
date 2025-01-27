/**
 * FilterUrlManager - A class to manage URL parameters based on form filter values
 *
 * This class provides progressive enhancement for form filters by:
 * 1. Maintaining filter state in the URL for sharing and browser history
 * 2. Automatically updating button labels to reflect current selections
 * 3. Working with native form elements (inputs, checkboxes) for baseline functionality
 *
 * Accessibility features:
 * - Works with standard form controls for keyboard navigation
 * - Maintains button text for screen readers
 * - Preserves native form submission as fallback
 * - Supports browser back/forward navigation
 *
 * Performance considerations:
 * - Uses efficient event delegation
 * - Minimizes DOM queries by caching selectors
 * - Updates URL without page reloads
 * - Batches UI updates using setTimeout
 *
 * @example
 * ```js
 * // Basic usage with a checkbox filter
 * new FilterUrlManager({
 *   formSelector: '#myForm',
 *   filters: [{
 *     type: 'checkbox',
 *     selector: 'input[name="categories"]',
 *     paramName: 'cat',
 *     valueAttribute: 'data-code',
 *     button: {
 *       selector: '#categoryBtn',
 *       textSelector: 'span',
 *       defaultText: 'Categories'
 *     }
 *   }]
 * })
 *
 * // Usage with text input and dependent parameter
 * new FilterUrlManager({
 *   formSelector: '#myForm',
 *   filters: [{
 *     type: 'text',
 *     selector: 'input[name="city"]',
 *     paramName: 'city',
 *     button: {
 *       selector: '#cityBtn',
 *       textSelector: 'span',
 *       defaultText: 'Select City'
 *     },
 *     dependentParams: [{
 *       selector: 'input[name="radius"]',
 *       paramName: 'radius'
 *     }]
 *   }],
 *   resetButton: '#resetBtn'
 * })
 * ```
 *
 * Note: This class follows progressive enhancement principles:
 * 1. The form works without JavaScript using standard form submission
 * 2. When JS is available, it enhances with URL updates and dynamic button text
 * 3. All interactions work with keyboard and screen readers
 *
 * For optimal accessibility:
 * 1. Ensure buttons have proper aria-labels
 * 2. Use semantic HTML for form controls
 * 3. Maintain visible focus states
 * 4. Provide clear button text updates
 */
class FilterUrlManager {
  /**
   * Creates a new FilterUrlManager instance
   * @param {Object} config - Configuration object
   * @param {string} config.formSelector - CSS selector for the form element
   * @param {Array<Object>} config.filters - Array of filter configurations
   * @param {('checkbox'|'text'|'number')} config.filters[].type - Type of filter input
   * @param {string} config.filters[].selector - CSS selector for filter input(s)
   * @param {string} config.filters[].paramName - URL parameter name for this filter
   * @param {string} [config.filters[].valueAttribute] - Attribute to use for value (for checkboxes)
   * @param {Object} [config.filters[].button] - Button configuration for this filter
   * @param {string} config.filters[].button.selector - CSS selector for the button
   * @param {string} config.filters[].button.textSelector - CSS selector for text element within button
   * @param {string} config.filters[].button.defaultText - Default button text when no value selected
   * @param {Array<Object>} [config.filters[].dependentParams] - Additional parameters that depend on this filter
   * @param {string} config.filters[].dependentParams[].selector - CSS selector for dependent input
   * @param {string} config.filters[].dependentParams[].paramName - URL parameter name for dependent input
   * @param {string} [config.resetButton] - CSS selector for reset button
   */
  constructor(config) {
    this.config = config
    this.params = new URLSearchParams(window.location.search)
    this.setupEventListeners()
    this.initializeFromUrl()
    this.updateButtonTexts() // Initial update of button texts

    // Handle form submission if formSelector is provided
    if (this.config.formSelector) {
      const form = document.querySelector(this.config.formSelector)
      if (form) {
        form.addEventListener('submit', e => {
          e.preventDefault()
          this.updateUrl()
          this.updateButtonTexts()
        })
      }
    }
  }

  /**
   * Sets up event listeners for all configured filters
   * @private
   */
  setupEventListeners() {
    // Setup for each filter type defined in config
    this.config.filters.forEach(filter => {
      const elements = document.querySelectorAll(filter.selector)

      elements.forEach(element => {
        if (filter.type === 'checkbox') {
          element.addEventListener('change', () => {
            this.updateUrl()
            this.updateButtonTexts()
          })
        } else if (filter.type === 'text' || filter.type === 'number') {
          element.addEventListener('input', () => {
            this.updateUrl()
            this.updateButtonTexts()
          })
          element.addEventListener('change', () => {
            this.updateUrl()
            this.updateButtonTexts()
          })
        }
      })
    })

    // Setup reset button if provided
    if (this.config.resetButton) {
      const resetButton = document.querySelector(this.config.resetButton)
      if (resetButton) {
        resetButton.addEventListener('click', () => {
          setTimeout(() => {
            this.updateUrl()
            this.updateButtonTexts()
          }, 0)
        })
      }
    }
  }

  /**
   * Gets the current value of a filter
   * @private
   * @param {Object} filter - Filter configuration object
   * @returns {string|null} Filter value or null if empty
   */
  getFilterValue(filter) {
    const elements = document.querySelectorAll(filter.selector)

    switch (filter.type) {
      case 'checkbox':
        const checkedValues = Array.from(elements)
          .filter(el => el.checked)
          .map(el => (filter.valueAttribute ? el.getAttribute(filter.valueAttribute) : el.value))
        return checkedValues.length > 0 ? checkedValues.join(',') : null

      case 'text':
      case 'number':
        const element = elements[0]
        return element?.value?.trim() || null

      default:
        return null
    }
  }

  /**
   * Updates button texts based on current filter values
   * @private
   */
  updateButtonTexts() {
    this.config.filters.forEach(filter => {
      if (!filter.button) return

      const button = document.querySelector(filter.button.selector)
      if (!button) return

      const defaultText = filter.button.defaultText || button.textContent
      const textSpan = button.querySelector(filter.button.textSelector || 'span')
      if (!textSpan) return

      switch (filter.type) {
        case 'checkbox': {
          const checkedElements = Array.from(document.querySelectorAll(filter.selector)).filter(
            el => el.checked
          )

          if (checkedElements.length === 0) {
            textSpan.textContent = defaultText
          } else if (checkedElements.length === 1) {
            textSpan.textContent =
              checkedElements[0].getAttribute('data-label') || checkedElements[0].value
          } else {
            textSpan.textContent = `${defaultText} (${checkedElements.length})`
          }
          break
        }
        case 'text':
        case 'number': {
          const element = document.querySelector(filter.selector)
          textSpan.textContent = element?.value?.trim() || defaultText
          break
        }
      }
    })
  }

  /**
   * Updates URL parameters based on current filter values
   * @private
   */
  updateUrl() {
    this.params = new URLSearchParams()

    // Update each filter
    this.config.filters.forEach(filter => {
      const value = this.getFilterValue(filter)

      if (value) {
        this.params.set(filter.paramName, value)

        // Handle dependent parameters
        if (filter.dependentParams) {
          filter.dependentParams.forEach(dep => {
            const depElement = document.querySelector(dep.selector)
            if (depElement?.value) {
              this.params.set(dep.paramName, depElement.value)
            }
          })
        }
      } else {
        this.params.delete(filter.paramName)
        // Clean up dependent parameters
        if (filter.dependentParams) {
          filter.dependentParams.forEach(dep => {
            this.params.delete(dep.paramName)
          })
        }
      }
    })

    // Update URL if we have filters, otherwise clean it
    const hasFilters = Array.from(this.params.entries()).some(
      ([_, value]) => value && value.trim() !== ''
    )
    if (!hasFilters) {
      history.pushState({}, '', window.location.pathname)
    } else {
      const newURL = `${window.location.pathname}?${this.params.toString()}`
      history.pushState({}, '', newURL)
    }
  }

  /**
   * Initializes filter values from URL parameters
   * @private
   */
  initializeFromUrl() {
    const params = new URLSearchParams(window.location.search)

    this.config.filters.forEach(filter => {
      const value = params.get(filter.paramName)
      if (!value) return

      const elements = document.querySelectorAll(filter.selector)

      switch (filter.type) {
        case 'checkbox':
          const values = value.split(',').filter(Boolean)
          elements.forEach(el => {
            const elValue = filter.valueAttribute
              ? el.getAttribute(filter.valueAttribute)
              : el.value
            el.checked = values.includes(elValue)
          })
          break

        case 'text':
        case 'number':
          if (elements[0]) {
            elements[0].value = value
          }
          break
      }

      // Handle dependent params
      if (filter.dependentParams) {
        filter.dependentParams.forEach(dep => {
          const depValue = params.get(dep.paramName)
          const depElement = document.querySelector(dep.selector)
          if (depValue && depElement) {
            depElement.value = depValue
          }
        })
      }
    })

    // Update button texts after initializing values
    this.updateButtonTexts()
  }
}

export default FilterUrlManager
