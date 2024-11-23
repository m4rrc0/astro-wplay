class MtObf extends HTMLAnchorElement {
  constructor() {
    super()

    const varFromCss = prop => {
      return this.style.getPropertyValue(`--mtobf-${prop}`).trim().replaceAll('"', '')
    }
    this.pre1 = varFromCss('pre1')
    this.pre2 = varFromCss('pre2')
    this.post1 = varFromCss('post1')
    this.post2 = varFromCss('post2')
  }

  connectedCallback() {
    this.onmouseover = () => this.deobf()
    this.onfocus = () => this.deobf()
  }

  deobf() {
    this.dataset.mtobf = 'false'
    this.innerHTML = [this.pre1, this.pre2, '&#', '64;', this.post1, this.post2].join('')
    this.href = ['mai', 'lt', 'o:', this.pre1, this.pre2, '@', this.post1, this.post2].join('')
  }
}

customElements.define('mt-obf', MtObf, { extends: 'a' })
