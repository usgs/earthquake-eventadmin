/* global EventConfig, EventDetails, OffCanvas */
'use strict';

var EventPage = require('base/EventPage'),
    AdminModule = require('admin/AdminModule'),
    ImpactModule = require('impact/ImpactModule'),
    ScientificModule = require('scientific/ScientificModule'),
    SummaryModule = require('summary/SummaryModule'),
    SummaryPage = require('admin/general/SummaryPage'),
    InteractiveMap = require('summary/InteractiveMap'),
    ImpactSummaryPage = require('impact/ImpactSummaryPage'),
    DYFIPage = require('impact/DYFIPage'),
    DYFIFormPage = require('impact/DYFIFormPage'),
    ShakeMapPage = require('impact/ShakeMapPage'),
    PagerPage = require('impact/PagerPage'),
    ScientificSummaryPage = require('scientific/ScientificSummaryPage'),
    HypocenterPage = require('scientific/HypocenterPage'),
    MomentTensorPage = require('scientific/MomentTensorPage'),
    FocalMechanismPage = require('scientific/FocalMechanismPage'),
    FiniteFaultPage = require('scientific/FiniteFaultPage'),
    IrisProductsPage = require('scientific/IrisProductsPage');


var eventpage,
    offcanvas;

eventpage = new EventPage({
  eventDetails: EventDetails,
  eventConfig: EventConfig,
  modules: [
    new AdminModule({
      'eventDetails': EventDetails,
      'eventConfig': EventConfig
    }),

    new SummaryModule({
        'eventDetails': EventDetails,
        'eventConfig': EventConfig,
        'pages': [
          {
            factory: SummaryPage,
            options: {
              title: 'Summary',
              hash: 'summary'
            },
            //Always include page.
            hasContent: function () {
              return true;
            },
            productTypes: ['origin', 'geoserve']
          },
          {
            factory: InteractiveMap,
            options: {
              title: 'Interactive Map',
              hash: 'map'
            }
          }
        ]
    }),

    new ImpactModule({
      'eventDetails': EventDetails,
      'eventConfig': EventConfig,
      'pages': [
        {
          factory: ImpactSummaryPage,
          options: {
            title: 'Summary',
            hash: 'summary'
          },
          productTypes: [
            'dyfi',
            'shakemap',
            'losspager'
          ]
        },
        {
          factory: DYFIPage,
          options: {
            title: 'Did You Feel It?',
            hash: 'dyfi'
          },
          productTypes: ['dyfi']
        },
        {
          factory: DYFIFormPage,
          options: {
            title: 'Tell Us!',
            hash: 'tellus'
          }
        },
        {
          factory: ShakeMapPage,
          options: {
            title: 'Shakemap',
            hash: 'shakemap'
          },
          productTypes: ['shakemap']
        },
        {
          factory: PagerPage,
          options: {
            title: 'PAGER',
            hash: 'pager'
          },
          productTypes: ['losspager']
        }
      ]
    }),

    new ScientificModule({
      'eventDetails': EventDetails,
      'eventConfig': EventConfig,
      'pages': [
        {
          factory: ScientificSummaryPage,
          options: {
            title: 'Summary',
            hash: 'summary'
          },
          productTypes: [
            'origin',
            'phase-data',
            'moment-tensor',
            'focal-mechanism',
            'finite-fault'
          ]
        },
        {
          factory: HypocenterPage,
          options: {
            title: 'Origin',
            hash: 'origin'
          },
          productTypes: [
            'origin',
            'phase-data'
          ]
        },
        {
          factory: MomentTensorPage,
          options: {
            title: 'Moment Tensor',
            hash: 'tensor'
          },
          productTypes: ['moment-tensor']
        },
        {
          factory: FocalMechanismPage,
          options: {
            title: 'Focal Mechanism',
            hash: 'mechanism'
          },
          productTypes: ['focal-mechanism']
        },
        {
          factory: FiniteFaultPage,
          options: {
            title: 'Finite Fault',
            hash: 'finitefault'
          },
          productTypes: ['finite-fault']
        },
        {
          factory: IrisProductsPage,
          options: {
            title: 'Waveforms',
            hash: 'waveforms'
          }
        }
      ]
    })
  ],
  defaultPage: 'admin_summary'
});


offcanvas = OffCanvas.getOffCanvas();
eventpage.on('render', function () {
  offcanvas.hide();
});
