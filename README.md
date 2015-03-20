earthquake-eventadmin
==============

Web application for administering earthquake event products.

Getting Started
---------------

[Use git to clone earthquake-eventpages from git repository](readme_git_install.md)

[Install needed dependencies and run them](readme_dependency_install.md)


### Configure the Project ###
1. run ./src/lib/pre-install to setup config.ini
   1. URL Path for application: leave as default for now.
   1. URL stub for event detail GEOJSON web service:
      enter http://comcat.cr.usgs.gov/earthquakes/eventpage/%s.geojson
   1. URL stub for event detail ATOM web service: leave as default for now.

### Example Usage ###
1. Run grunt from the install directory.

### Notes ###
1. This application uses the earthquake responsive template found at
   https://github.com/usgs/hazdev-template.git
   The responsive template dependency is not bundled during build, so sites
   can configure their theme, and must be installed before this application
   is deployed.
