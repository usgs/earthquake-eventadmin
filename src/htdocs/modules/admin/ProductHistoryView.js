'use strict';

var CatalogEvent = require('CatalogEvent'),
    Product = require('Product'),

    ModalView = require('mvc/ModalView'),
    SendProductView = require('admin/SendProductView'),
    View = require('mvc/View');

var ProductHistoryView = function (options) {
  var _this,
      _initialize,

      // variables
      _dialog,
      _el,
      _event,
      _page,
      _products = [],
      //_productTypes = [],
      _section,


      // methods
      _deleteProduct,
      _editProduct,
      _trumpProduct,
      _sendProduct;

  _this = View(options);

  _initialize = function () {
    var products = [];

    _el = _this.el;
    _page = options.page;

    _section = document.createElement('section');
    _section.className = 'associated-products';
    _el.appendChild(_section);

    // get event
    _event = CatalogEvent(options.eventDetails);

    // get products
    products = CatalogEvent.removePhases(options.products);

    for (var i = 0; i < products.length; i++) {
      _products = _products.concat(
          _event.getAllProductVersions(
            products[i].type,
            products[i].source,
            products[i].code
          ));
    }

    // render the view
    _this.render();

    _dialog = ModalView(_section, {
      title: 'Product History',
      closable: true
    });
    _dialog.show();

    options = null;
  };

  _trumpProduct = function (product) {
    var trumpProduct;

    trumpProduct = Product({
        source: product.source,
        type: 'trump-' + product.type,
        code: product.code,
        properties: {
          'eventSource': product.properties.eventsource,
          'eventSourceCode': product.properties.eventsourcecode,
          'trump-source': product.source,
          'trump-code': product.code
        }
      });

    _sendProduct(trumpProduct);
  };

  _editProduct = function (product) {
    console.log('triggered _editProduct');
    console.log(product);
  };

  _deleteProduct = function (product) {
    var deleteProduct;

    deleteProduct = Product({
        source: product.source,
        type: product.type,
        status: Product.STATUS_DELETE,
        code: product.code,
        properties: {
          eventSource: product.properties.eventsource,
          eventSourceCode: product.properties.eventsourcecode
        }
      });

    _sendProduct(deleteProduct);
  };

  _sendProduct = function (product) {
    // send product
    var sendProductView,
        productSent;

    sendProductView = SendProductView({
      product: product,
      formatProduct: function (products) {
        // format product being sent
        return sendProductView.formatProduct(products);
      }
    });
    sendProductView.on('success', function () {
      // track that product was sent
      productSent = true;
    });
    sendProductView.on('cancel', function () {
      if (productSent) {
        // product was sent, which will modify the event
        // reload page to see update
        window.location.reload();
      } else {
        // product not sent, cleanup
        product = null;
        sendProductView.destroy();
        sendProductView = null;
      }
    });
    sendProductView.show();
  };

  _this.render = function () {
    // call getSummaryContent and append the content to the modal dialog
    _section.appendChild(_page.getSummaryContent(_products));
  };

  _initialize();
  return _this;
};

module.exports = ProductHistoryView;
