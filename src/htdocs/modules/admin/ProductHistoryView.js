'use strict';

var CatalogEvent = require('CatalogEvent'),
    Product = require('Product'),

    Collection = require('mvc/Collection'),
    ModalView = require('mvc/ModalView'),
    ProductsView = require('admin/ProductsView'),
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
      _getProductViewByType,
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
    products = options.products;

    if (_page._options.hash === 'origin') {
      products = CatalogEvent.removePhases(options.products);
    }


    // get products
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

  _getProductViewByType = function (type) {
    var section,
        products = [];

    // Append Products Collection Table
    section = _section.querySelector('.associated-products-' + type);

    for (var i = 0; i < _products.length; i++) {
      if (type === _products[i].type) {
        products.push(_products[i]);
      }
    }

    // Build Associated Products Collection Table
    ProductsView({
      el: section,
      collection: Collection(products),
      preferredProduct: products[0],
      buttons: [
        {
          title: 'Trump Preferred',
          className: 'trump',
          callback: _trumpProduct
        },
        {
          title: 'Edit Product',
          className: 'edit',
          callback: _editProduct
        },
        {
          title: 'Delete Product',
          className: 'delete',
          callback: _deleteProduct
        }
      ]
    });
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



    for (var i = 0; i < _products.length; i++) {
      _section.appendChild(_page.buildSummaryMarkup(_products[i]));
    }

    // var type = null,
    //     product = null,
    //     i;

    // for(i = 0; i < _products.length; i++) {
    //   product = _products[i];
    //   if (type !== product.type) {
    //     type = product.type;
    //     _productTypes.push(type);
    //     _section.innerHTML = _section.innerHTML + '<h4>' + type + '</h4>' +
    //         '<section class="associated-products-' + type + '"></section>';
    //   }
    // }

    // for(i = 0; i < _productTypes.length; i++) {
    //   _getProductViewByType(_productTypes[i]);
    // }

  };

  _initialize();
  return _this;
};

module.exports = ProductHistoryView;
