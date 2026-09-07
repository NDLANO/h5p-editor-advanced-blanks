import './h5p-editor-advanced-blanks-list-checkbox.scss';

/** Class for ListCheckbox H5P widget */
export default class AdvancedBlanksListCheckbox {
  /**
   * @constructor
   * @param {object} parent Parent element in semantics.
   * @param {object} field Semantics field properties.
   * @param {object} params Parameters entered in editor form.
   * @param {function} setValue Callback to set parameters.
   */
  constructor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;

    // Callbacks to call when parameters change
    this.changes = [];

    // Let parent handle ready callbacks of children
    this.passReadies = true;

    this.$container = H5P.jQuery('<div>', { class: 'h5peditor-advanced-blanks-list-checkbox' });

    this.fieldInstance = new H5PEditor.widgets[this.field.type](this.parent, this.field, this.params, this.setValue);
    this.fieldInstance.appendTo(this.$container);

    this.$errors = this.$container.find('.h5p-errors');

    if (this.field?.listCheckbox?.checkbox) {
      this.handleListItemAdded = this.handleListItemAdded.bind(this);
      this.handleListItemRemoved = this.handleListItemRemoved.bind(this);

      this.fieldInstance.forEachChild((child) => {
        this.addChangeListener(child);
      });

      this.fieldInstance.on('addedItem', this.handleListItemAdded);
      this.fieldInstance.on('removedItem', this.handleListItemRemoved);

      this.updateCheckboxes();
    }
  }

  /**
   * Handle item added to list.
   * @param {Event} event Event added to the list.
   */
  handleListItemAdded(event) {
    if (!(event?.data instanceof H5PEditor.Group)) {
      return;
    }

    this.addChangeListener(event.data);
    this.updateCheckboxes();
  }

  /**
   * Handle item removed from list.
   */
  handleListItemRemoved() {
    this.updateCheckboxes();
  }

  /**
   * Add change listener to checkbox.
   * @param {H5PEditor.Group} group Group to look for checkbox field in.
   */
  addChangeListener(group) {
    const checkbox = H5PEditor.findField(this.field.listCheckbox.checkbox, group);
    if (!checkbox) {
      return;
    }

    checkbox.changes.push(() => {
      this.updateCheckboxes();
    });
  }

  /**
   * Update checkboxes.
   */
  updateCheckboxes() {
    const checkboxes = [];
    this.fieldInstance.forEachChild((child) => {
      const checkbox = H5PEditor.findField(this.field.listCheckbox.checkbox, child);
      if (checkbox) {
        checkboxes.push(checkbox);
      }
    });

    // If one checkbox is checked, hide all the others, else show all
    const isOneChecked = checkboxes.some((checkbox) => checkbox.value);
    checkboxes.forEach((checkbox) => {
      checkbox.$input
        .parents(`.field-name-${this.field.listCheckbox.checkbox}.boolean`)
        .toggleClass('display-none', !checkbox.value && isOneChecked);
    });
  }

  /**
   * Append field to wrapper. Invoked by H5P core.
   * @param {H5P.jQuery} $wrapper Wrapper.
   */
  appendTo($wrapper) {
    this.$container.appendTo($wrapper);
  }

  /**
   * Validate current values. Invoked by H5P core.
   * @return {boolean} True, if current value is valid, else false.
   */
  validate() {
    return this.fieldInstance.validate();
  }

  /**
   * Remove self. Invoked by H5P core.
   */
  remove() {
    this.$container.remove();
    this.fieldInstance.off('removedItem', this.handleListItemRemoved);
  }
};
