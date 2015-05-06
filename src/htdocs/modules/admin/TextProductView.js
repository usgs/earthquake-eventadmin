'use strict';


var ContentsManagerView = require('ContentsManagerView'),
    Product = require('Product'),
    ProductContent = require('ProductContent'),

    SendProductView = require('admin/SendProductView'),

    Collection = require('mvc/Collection'),
    ModalView = require('mvc/ModalView'),
    View = require('mvc/View'),

    Util = require('util/Util');


/**
 * A modal view for edition/creating text products.
 *
 * @param options Object
 *      An object containing configuration options. This object MUST contain
 *      either a "product" reference, or "type", "source" "code",
 *      "eventSource" and "eventSourceCode" properties. If one of these
 *      cases is not met, and error is thrown during initialization.
 */
var TextProductView = function (options) {
  var _this,
      _initialize,

      _contentsManagerView,
      _dialog,
      _previewEl,
      _product,
      _sender,
      _sendProductView,
      _textEl,
      _toggleButton,

      _createViewSkeleton,
      _onCancel,
      _onCreate,
      _onSendProductDone,
      _onToggleClick;

  _this = View(options);

  /**
   * Constructor
   *
   * @see TextProductView documentation
   */
  _initialize = function (options) {
    var titleText = 'Edit Product';

    _product = options.product;

    if (!_product) {
      titleText = 'Create Product';

      if (!options.type || !options.source || !options.code ||
          !options.eventSource || !options.eventSourceCode) {
        throw new Error('Must receive either a product or type/source/code ' +
            'and eventSource/eventSourceCode properties.');
      }

      _product = Product({
        type: options.type,
        source: options.source,
        code: options.code,
        properties: {
          eventsource: options.eventSource,
          eventsourcecode: options.eventSourceCode,
          'review-status': 'Reviewed',
        },
        contents: Collection([
          ProductContent({id: '', bytes: ''})
        ])
      });
    }

    _createViewSkeleton();
    _toggleButton.addEventListener('click', _onToggleClick);

    _sendProductView = SendProductView({product: _product});
    _sendProductView.on('done', _onSendProductDone);

    _dialog = ModalView(_this.el, {
      title: options.modalTitle || titleText,
      closable: false,
      buttons: [
        {
          classes: ['textproduct-create', 'green'],
          text: 'Create',
          callback: _onCreate
        },
        {
          classes: ['textproduct-cancel'],
          text: 'Cancel',
          callback: _onCancel
        }
      ]
    });
  };


  _createViewSkeleton = function () {
    _this.el.classList.add('textproduct');

    _this.el.innerHTML = [
      '<div class="vertical textproduct-edit">',
        '<label for="textproduct-text">',
          'Text Content',
          '<small>',
            'May Include HTML Markup (',
            '<a href="javascript:void(null);" class="textproduct-toggle">',
              'Preview',
            '</a>)',
          '</small>',
        '</label>',
        '<textarea id="textproduct-text" ',
            'class="textproduct-text"></textarea>',
        '<div class="textproduct-preview hidden"></div>',
        '<h3>Attach Files</h3>',
        '<p>',
          'Typically attached files are resources which you might reference ',
          'in the text product (above). You can reference these resources as ',
          'links (&lt;a&gt; tags) or images (&lt;img&gt; tags) etc&hellip; ',
          'You can use the file name as the &ldquo;href&rdquo; or ',
          '&ldquo;src&rdquo; attributes respectively. Use the ',
          '&ldquo;preview&rdquo; feature to verify proper usage.',
        '</p>',
        '<div class="contents-manager-view"></div>',
      '</div>'
    ].join('');

    _textEl = _this.el.querySelector('.textproduct-text');
    _previewEl = _this.el.querySelector('.textproduct-preview');
    _toggleButton = _this.el.querySelector('.textproduct-toggle');

    _contentsManagerView = ContentsManagerView({
      el: _this.el.querySelector('.contents-manager-view'),
      model: _product
    });
  };

  /**
   * Called when the user cancels the add/edit view. Hides and destroys self
   * and triggers a "cancel" event.
   *
   */
  _onCancel = function () {
    _this.hide();
    _this.trigger('cancel');

    _this.destroy();
  };

  /**
   * Called when the user submits the add/edit view. It updates the product
   * with the current values in the view then shows a confirmation dialog
   * before sending (via the SendProductview).
   *
   */
  _onCreate = function () {
    var contents = _product.get('contents'),
        content = contents.get(''),
        contentAttributes = null,
        text = _textEl.value || '';

    contentAttributes = {
      path: '',
      bytes: text,
      contentType: 'text/html',
      lastModified: (new Date()).getTime(),
      length: text.length
    };

    if (content) {
      content.set(contentAttributes);
    } else {
      content = ProductContent(contentAttributes);
      contents.add(content);
    }

    _sendProductView.show();
  };

  /**
   * Called after user attempts to send product and acknowledges the success
   * and/or error message from the sender view. In this case, we're done, so
   * clean up after ourself.
   *
   */
  _onSendProductDone = function () {
    _this.hide();

    _this.trigger('done', {product: _product});
    _this.destroy();
  };

  /**
   * Called when user clicks toggle button. Switches between edit and preview
   * modes of this view.
   *
   */
  _onToggleClick = function () {
    if (_toggleButton.innerHTML === 'Preview') {
      _toggleButton.innerHTML = 'Edit';
    } else {
      _toggleButton.innerHTML = 'Preview';
    }

    _previewEl.innerHTML = _textEl.value;

    _textEl.classList.toggle('hidden');
    _previewEl.classList.toggle('hidden');
  };


  /**
   * Should be called when finished with this view. Cleans up resources and
   * references.
   *
   */
  _this.destroy = Util.compose(function () {
    _contentsManagerView.destroy();
    _toggleButton.removeEventListener('click', _onToggleClick);

    _sendProductView.off('done', _onSendProductDone);
    _sendProductView.destroy();

    _dialog.hide();
    _dialog.destroy();

    _contentsManagerView = null;
    _dialog = null;
    _previewEl = null;
    _product = null;
    _sender = null;
    _sendProductView = null;
    _textEl = null;
    _toggleButton = null;

    _createViewSkeleton = null;
    _onCancel = null;
    _onCreate = null;
    _onSendProductDone = null;
    _onToggleClick = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  /**
   * Hides this view. State is preserved so it can be re-shown if desired.
   *
   */
  _this.hide = function () {
    _dialog.hide();
  };

  /**
   * Updates the values displayed in the view based on the current product
   * state.
   *
   */
  _this.render = function () {
    var content,
        contents = _product.get('contents');

    if (contents && contents.get) {
      content = contents.get('');
    }

    if (!content) {
      _textEl.value = '';
    } else {
      _textEl.value = content.get('bytes');
    }
  };

  /**
   * Updates the view displayed values based on the current product state. Then
   * shows this view in a modal dialog.
   *
   */
  _this.show = function () {
    _this.render();
    _dialog.show();
  };


  _initialize(options||{});
  options = null;
  return _this;
};


module.exports = TextProductView;
