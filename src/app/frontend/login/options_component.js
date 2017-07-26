class LoginOptionsController {
  constructor() {
    this.options = [];
    this.selectedOption;
  }

  select(option) {
    this.options.forEach(option => {
      option.selected = false;
    });

    option.selected = true;
    this.selectedOption = option.title;
  }

  addOption(option) {
    if (this.options.length === 0) {
      this.select(option);
    }

    this.options.push(option);
  }

  onOptionChange() {
    this.options.forEach(option => {
      option.selected = option.title === this.selectedOption;
    })
  }
}

export const loginOptionsComponent = {
  transclude: true,
  templateUrl: 'login/options.html',
  controller: LoginOptionsController,
};
