'use strict';

/**
 * @ngdoc service
 * @name breazehomeDesktop.Properties
 * @description
 * # Service to manipulate and get Properties from our API
 * Properties service in the breazehomeDesktop.
 */

angular.module('breazehomeDesktop').factory('Properties', function (BASE_URL, $http, $rootScope, $filter, $q, Polygons, Utilities) {

  return {
    /**
     * @ngdoc property
     * @propertyOf breazehomeDesktop.Properties
     * @name searches
     * @returns {object} Search constraint
     * @description
     *   This property stores the searching history list.
     */
    searches: {},

    /**
     * @ngdoc property
     * @propertyOf breazehomeDesktop.Properties
     * @name filter
     * @returns {object} Language list
     * @description
     *   This property stores the searching history list.
     */
    filter: {},
    //searches_results: {},

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name setSearch
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    setSearch: function(search, params) {
      this.searches = search;
      this.filter = params;
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name printSearch
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    printSearch: function(){
      console.log(this.searches);
      console.log(this.filter);
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getFilter
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    getFilter: function(){
      return this.filter;
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getSearch
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    getSearch: function(){
      return this.searches;
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getAll
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    // Get all properties
    getAll: function () {
      return $http({
        method  :   'GET',
        url     :   BASE_URL+'properties/',
        headers :   { 'Content-Type': 'application/json' }
      }).then(function successCallback(response){
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });

    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getLiens
     * @param {Object} idObj Property Object
     * @returns {Promise} The promise contains lien data
     * @description
     *   Get all the public liens of a Property.
     */
    getLiens: function (idObj) {
      return $http({
        method  :   'GET',
        url     :   BASE_URL+'liens/?folio_number__icontains=' + idObj.id,
        headers :   { 'Content-Type': 'application/json' }
      }).then(function successCallback(response){
          return response.data.results;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getCity
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    getCity: function(city) {
      var defer = $q.defer();
      return $http({
        method  :   'GET',
        url     :   'scripts/dictionaries/Cities.json',
        params  :   {city : city},
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function successCallback(response){
          // console.log("getCity params: ", city);
          defer.resolve(response)
          return defer.promise;
        },
        function errorCallback(response) {
          console.log("Could not find language JSON file");
        });

    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getById
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    // Get property detail by ID
    getById: function (idObj) {
      return $http({
        method  :   'GET',
        url     :   BASE_URL+'properties/'+idObj.id+'/detail/',
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function successCallback(response){
          var propertyInfo = response.data[0];
          return $http({
            method  :   'GET',
            url     :   BASE_URL+'properties/'+idObj.id+'/',
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
          }).then(function successCallback(response){
              propertyInfo.basicInfo = response.data;
              return propertyInfo;
            },
            function errorCallback(response) {
              //console.log(url);
              throw new Error('Could not get response from server');
            });
        },
        function errorCallback(response) {
          //console.log(url);
          throw new Error('Could not get response from server');
        });

      },

      getPropertyViews: function (idObj) {
        return $http({
          method  :   'GET',
          url     :   BASE_URL+'properties/'+idObj.id+'/views/',
          headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function successCallback(response){
          var propertyInfo = response.data[0];
          return $http({
            method  :   'GET',
            url     :   BASE_URL+'properties/'+idObj.id+'/',
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
          }).then(function successCallback(response){
            propertyInfo.basicInfo = response.data;
            return propertyInfo;
          },
          function errorCallback(response) {
            //console.log(url);
            throw new Error('Could not get response from server');
          });
        },
        function errorCallback(response) {
          //console.log(url);
          throw new Error('Could not get response from server');
        });

      },

/* START View Competition for Properties : adubu002@fiu.edu */
      updatePropertyViews: function (idObj) {
        return $http({
          method  :   'GET',
          url     :   BASE_URL+'properties/'+idObj.id+'/update_views/',
          headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function successCallback(response){
          var propertyInfo = response.data[0];
          return $http({
            method  :   'GET',
            url     :   BASE_URL+'properties/'+idObj.id+'/',
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
          }).then(function successCallback(response){
            propertyInfo.basicInfo = response.data;
            return propertyInfo;
          },
          function errorCallback(response) {
            //console.log(url);
            throw new Error('Could not get response from server');
          });
        },
        function errorCallback(response) {
          //console.log(url);
          throw new Error('Could not get response from server');
        });

      },
/* END View Competition for Properties */

      /**
      * @ngdoc method
      * @methodOf breazehomeDesktop.Properties
      * @name getMediaById
      * @param {string} provider Provider name
      * @returns {Promise} The promise contains user crendential
      * @description
      *   Get all the public Properties for a property.
      */
      // Get property images by ID
      getMediaById: function (id) {
        return $http({
          method  :   'GET',
          url     :   BASE_URL+'properties/'+id.id+'/media/',
          headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function successCallback(response){
            return response;
        },
        function errorCallback(response) {
            throw new Error('Could not get response from server');
        });
      },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getByOffset
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    // Get properties by offset
    getByOffset: function (offset) {
      return $http({
        method  :   'GET',
        url     :   BASE_URL+'properties/?offset='+offset,
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function successCallback(response){
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getByFilter
     * @param
     *     filter - The UI filter object that has the filter values that should be used
     *     mapBounds - The UI map object boundaries that can be used to requery the API as the map moves.  This is unused and has been dead code since before 08/21/2017, which is when the PoLR feature branch found it
     * @returns {Promise} The promise contains the search results themselves, or a deferred promise that will contain the search results from a pair of nested remote API calls.
     * @description
     *     An interception of the application filter call stack to determine if we are making remote API calls for generating PoLR and PoLR property search logic, or, a plain vanilla search filter by name/value elements
     *     that can be queried directly in the backend repository.
     */
    getByFilter: function (filter, mapBounds) {


      //Due to the asynchronous nature of the getCity, we need to MAKE SURE that getCity returns before the ajax call is sent off.
      //TODO: fix issues with city

      // if(filter.city != null){
      //   var urlCity;
      //   this.getCity(filter.city).then(function(data) {
      //     urlCity = data;
      //     var uppercaseCity = $filter('uppercase')(filter.city)
      //     urlParams = urlParams + "city__iexact=" + urlCity.data.cityDict[uppercaseCity] + "&";
      //   })
      // }
      var url = BASE_URL + 'properties?';
      var stringifiedIsochrone = "";
      var PoLRCriteria = null;
      var deferred = null;
      var urlParams = "";

      //Ashif , Openhouse
      if(filter.openhouse == true){
        urlParams = urlParams +  'isopenhouse=1&';
      }

      // End of Ashif , Openhouse
      //BEGIN PoLR Property Filter Collection and URL Assembly
      if (filter.searchInput != undefined && filter.commuteDay != undefined && filter.commuteTime != undefined && filter.commuteMinutes != undefined && filter.commuteType != undefined) {
        SETTINGS.VERBOSE_CONSOLE_DEBUG ? console.log("getByFilter() PoLR Search being processed!  filter.searchInput == [%s], filter.commuteDay == [%s], filter.commuteTime == [%s], filter.commuteMinutes == [%d], filter.commuteType== [%s]", filter.searchInput, filter.commuteDay, filter.commuteTime, filter.commuteMinutes, filter.commuteType) : null;

        urlParams = "origin_address={0}&arrival_datetime={1}&travel_duration={2}&travel_mode={3}".replace("{0}", encodeURIComponent(filter.searchInput));
        urlParams = urlParams.replace("{1}", encodeURIComponent(Utilities.getNextFutureArrivalDateAndTime(filter.commuteDay, filter.commuteTime)));
        urlParams = urlParams.replace("{2}", encodeURIComponent(filter.commuteMinutes));
        urlParams = urlParams.replace("{3}", filter.commuteType);
        url = BASE_URL + 'geometries/get_polr/?';
        deferred = $q.defer();

        $http({
          method: 'GET',
          url: url + urlParams,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function successCallback(response) {
            $rootScope.PoLR = PoLRCriteria = response.data;

            //our GEOSGeometry backend wants the first point to be explicitly added as the last point to close the polygon, so we concat PoLRCriteria["isochrone"][0]
            stringifiedIsochrone = Polygons.getStringifiedIsochrone(PoLRCriteria["isochrone"].concat(new Array(PoLRCriteria["isochrone"][0].slice(0, 2))), SETTINGS.POLR_ISOCHRONE_STRINGIFICATION_GEOSGEOMETRY, " ", ",");

            SETTINGS.VERBOSE_CONSOLE_DEBUG ? console.log("getByFilter() - PoLRCriteria ==", PoLRCriteria) : null;

            urlParams = "polr=" + stringifiedIsochrone + "&";
            url = BASE_URL + 'properties/polr_properties?';

            deferred.resolve($rootScope.retrieveFilteredProperties(filter, mapBounds, url, urlParams));  //in callback scope the "this" context is gone and hence retrieveFilteredProperties is undefined.  A pointer to retrieveFilteredProperties from the caller is used.
          },
          function errorCallback(response) {
            throw new Error('Could not get response from server');
            deferred.reject();
          });

        return deferred.promise;  //return the promise to return the promise of the filter function itself once we gather up our PoLR isochrone and merge it with other filters
      }
      else {  //general Property Filter Collection and URL Assembly
        return this.retrieveFilteredProperties(filter, mapBounds, url, urlParams);  //return the promise from the filter function itself
        $rootScope.PoLR = null;
      }
      //END PoLR Property Filter Collection and URL Assembly
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name retrieveFilteredProperties
     * @param
     *     filter - The UI filter object that has the filter values that should be used
     *     mapBounds - The UI map object boundaries that can be used to requery the API as the map moves.  This is unused and has been dead code since before 08/21/2017, which is when the PoLR feature branch found it
     *     url - The backend API URL that should be invoked.  Can be a direct retrieval API call or an API call that encapsulates business logic for retrieving properties.
     *     urlParam - The query string name/value pairs for the API URL.
     * @returns {Promise} The promise contains the search results themselves.
     * @description
     *     Executes a call to the backend APIs for retrieving properties matching one or more search criteria specified in the urlParams parameter.
     */
    //BEGIN PoLR Property Existing Filter Code Wrapper
    retrieveFilteredProperties: function(filter, mapBounds, url, urlParams) {

      //Due to the asynchronous nature of the getCity, we need to MAKE SURE that getCity returns before the ajax call is sent off.
      //TODO: fix issues with city -  This is unused and has been dead code since before 08/21/2017, which is when the PoLR feature branch found it
      if (filter.city != null) {
        var urlCity;
        this.getCity(filter.city).then(function (data) {
          urlCity = data;
          var uppercaseCity = $filter('uppercase')(filter.city);
          urlParams = urlParams + "city__iexact=" + urlCity.data.cityDict[uppercaseCity] + "&";
        });
      }


      //START of Lester's filtering code - #783 - lhern207@fiu.edu!//

      //Start of property type filters//

      //DISABLED as this currently returns scarce results//
      if (filter.apartment == true) {
        urlParams = urlParams + "property_type=APT&property_type=DUPLEX&property_type=FOURPLEX&property_type=EFF&";
      }

      if (filter.condo == true) {
        urlParams = urlParams + "property_type=CONDO&property_type=RE2&";
      }

      if (filter.house == true) {
        urlParams = urlParams + "property_type=MULTI&property_type=RE1&";
      }

      //DISABLED as this currently returns 0 results//
      if (filter.trailer == true) {
        urlParams = urlParams + "property_type=MOBILE&property_type=AGRI&";
      }

      //DISABLED as this currently returns 0 results//
      if (filter.land == true) {
        urlParams = urlParams + "property_type=RLD&property_type=AGRI&";
      }

      if (filter.townhouse == true) {
        urlParams = urlParams + "property_type=RE2&";
      }

      if (filter.other == true) {
        urlParams = urlParams + "property_type=COMMERC&property_type=COOP&property_type=DOCKOMIN&property_type=HOTEL&property_type=INCOME&property_type=INDUST&property_type=LEASE&property_type=OTHER&property_type=RESI&property_type=BUS&property_type=CLD&property_type=COM&property_type=RIN&property_type=RNT&";
      }
      //End of property types filters

      if (filter.beds_min != null && filter.beds_max != null) {
        if (filter.beds_max == "8+") {
          if (filter.beds_min == "8+") {
            urlParams = urlParams + "beds_total__gte=8&";
          }
          else{
            urlParams = urlParams + "beds_total__gte=" + filter.beds_min + "&";
          }
        }
        else{
          urlParams = urlParams + "beds_total__lte=" + filter.beds_max +
            "&beds_total__gte=" + filter.beds_min + "&";
        }
      }

      //!This code is not complete. Admin hacking on Django API is needed to perform logical OR
      //querystrings for half bathrooms.
      if (filter.baths_min != null && filter.baths_max != null) {
        if (filter.baths_max == "4+") {
          if (filter.baths_min == "4+") {
            urlParams = urlParams + "baths_full__gte=4&";
          }
          else{
            if (parseFloat(filter.baths_min) % 1 == 0) {
              urlParams = urlParams + "baths_full__gte=" + filter.baths_min + "&";
            }
            else{
              //Incomplete.Quickfix//
              urlParams = urlParams + "baths_full__gte=" + (parseInt(filter.baths_min) + 1) + "&";
            }
          }
        }
        else{
          if (parseFloat(filter.baths_min) % 1 == 0) {
            urlParams = urlParams + "baths_full__gte=" + filter.baths_min +
              "&baths_full__lte=" + filter.baths_max + "&";
          }
          else{
            if (filter.baths_min == filter.baths_max) {
              urlParams = urlParams + "baths_full=" + (parseInt(filter.baths_min)) + "&baths_half=1&";
            }
            else{
              //Incomplete.QuickFix//
              urlParams = urlParams + "baths_full__gte=" + (parseInt(filter.baths_min) + 1) + "&baths_full__lte=" + (parseInt(filter.baths_max)) + "&";
            }
          }
        }
      }


      //Start of Listing type filters//

      //Disabled due to scarce result numbers//
      if (filter.sale == true) {
        urlParams = urlParams + "for_sale_yn=True&";
      }

      //Disabled due to scarce result numbers//
      if (filter.rent == true) {
        urlParams = urlParams + "for_lease_yn=True&";
      }

      //No database field for this//
      if (filter.shared == true) {

      }

      //No database field for this//
      if (filter.foreclosure == true) {

      }

      //No database field for this//
      if (filter.sublet == true) {

      }

      //Here goes open houses filter, to be moved from calling function to here//
      //End of listing type filters//

      //No database field for this//
      if (filter.price_per_sqft_min != null && filter.price_per_sqft_max != null) {

      }

      //Start of features and amenities filters
      //No database field for this//
      if (filter.gym == true) {

      }

      if (filter.pool == true) {
        urlParams = urlParams + "pool_yn=True&";
      }

      //No database field for this//
      if (filter.laundry == true) {

      }

      //No database field for this//
      if (filter.parking_garage == true) {

      }

      //No database field for this//
      if (filter.street_parking == true) {

      }

      //No database field for this//
      if (filter.concierge == true) {

      }

      //No database field for this//
      if (filter.yard == true) {

      }

      //Disabled due to scarce result numbers//
      if (filter.patio == true || filter.balcony == true || filter.porch == true) {
        urlParams = urlParams + "balcony_porchandor_patio_yn=True&";
      }

      //No database field for this//
      if (filter.waterfront == true) {

      }

      //No database field for this//
      if (filter.wheelchair_accessible == true) {

      }

      //End of features and amenities filters//



      if (filter.year_built_min != null && filter.year_built_max != null) {
        urlParams = urlParams + "year_built__lte=" + filter.year_built_max +
          "&year_built__gte=" + filter.year_built_min + "&";
      }

      //!For some reason property_sq_ft seems to be consistently storing a higher value in the database, than sq_ft_total, which seems to be storing living space only. Sometimes they store the same value. lot_sq_footage consistently stores the same as property_sq_ft. A lot of inconsistencies.!//
      if (filter.size_living_area_min != null && filter.size_living_area_max != null) {
        urlParams = urlParams + "sq_ft_total__lte=" + filter.size_living_area_max +
          "&sq_ft_total__gte=" + filter.size_living_area_min + "&";
      }

      //There's a field called lotSqFootage that's sometimes initialized null. Some information retrieval changes might be needed//
      if (filter.size_lot_min != null && filter.size_lot_max != null) {
        urlParams = urlParams + "property_sq_ft___lte=" + filter.size_lot_max +
          "&property_sq_ft__gte=" + filter.size_lot_min + "&";
      }

      /*Disabled. Meant to work with either a time on breazehome timestamp
        or the currently existing last updated timestamp. Instead of parsing
        the timestamp better create a field on the backend and then parse the timestam
        into that field in a human readable format.*/
      if (filter.last_updated != null) {

      }

      //!END of Lester's filtering code - #783 - lhern207@fiu.edu!//

      if (filter.priceMin != null && filter.priceMax != null) {
        urlParams = urlParams + "current_price__lte=" + filter.priceMax + "&current_price__gte=" + filter.priceMin + "&";
      }
      //Here we are going to check if we have an address to search by
      if (filter.address_internet_display != null) {
        console.log("What is the address being sent?");
        console.log(filter.address_internet_display);
        urlParams = urlParams + "address_internet_display__istartswith=" + filter.address_internet_display + "&";
      }

      if (filter.postal_code != null) {
        urlParams = urlParams + "postal_code__iexact=" + filter.postal_code + "&";
      }

      if (filter.city != null) {
        debugger;
        var urlCity;
        this.getCity(filter.city).then(function (data) {
          urlCity = data;
          var uppercaseCity = $filter('uppercase')(filter.city)
          urlParams = urlParams + "city__iexact=" + urlCity.data.cityDict[uppercaseCity] + "&";
        })
      }

      if (filter.state_or_province != null) {
        urlParams = urlParams + "state_or_province__iexact=" + filter.state_or_province + "&";
      }
      //Juan
      if (filter.commuteDay == undefined){
        urlParams = urlParams + "location_point__coveredby=" + mapBounds;
      }
      //console.log(urlParams);
      SETTINGS.VERBOSE_CONSOLE_DEBUG ? console.log("retrieveFilteredProperties() - urlParams == [%s]", urlParams) : null;
      return $http({
        method: 'GET',
        url: url + urlParams,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function successCallback(response) {
          SETTINGS.VERBOSE_CONSOLE_DEBUG ? console.log("retrieveFilteredProperties()->successCallback() - response == ", response) : null;
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },
    //END PoLR Property Existing Filter Code Wrapper

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getByQueryString
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    getByQueryString: function(urlParams) {
      return $http({
        method  :   'GET',
        url     :   BASE_URL+'properties?' + urlParams,
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function successCallback(response){
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getByPolygon
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    getByPolygon: function(urlParams) {
      console.log(BASE_URL+'properties/poly_properties?poly=' + urlParams)
      return $http({
        method  :   'GET',
        url     :   BASE_URL+'properties/poly_properties?poly=' + urlParams,
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function successCallback(response){
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getLocationById
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    getLocationById: function(id){
      // console.log("Location:  ", BASE_URL+'properties/'+id.id+"/location/")
      return $http ({
        method  : 'GET',
        url     : BASE_URL+'properties/'+id.id+"/location/",
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function successCallback(response) {
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name saveSearch
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    // Save user current search options
    saveSearch: function(title, filter) {
      if(!$rootScope['user']) {
        console.log("User id is not defined.");
        return "User id is not defined.";
      }
      var urlParams = "";
      if(filter.priceMin != null && filter.priceMax != null) {
        urlParams = urlParams + "current_price__lte=" + filter.priceMax + "&current_price__gte=" + filter.priceMin;
      }
      return $http ({
        method  : 'POST',
        url     : BASE_URL+'users/'+$rootScope['user'].id+'/searches/',
        headers :   { 'Content-Type': 'application/json' },
        data: {
          title: title,
          query_string: urlParams,
          user: $rootScope['user'].id
        }
      }).then(function successCallback(response) {
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name save
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    // Save property to user's list
    save: function(pID) {
      return $http ({
        method  : 'POST',
        url     : BASE_URL+'users/'+$rootScope['user'].id+'/list/0/save/',
        headers :   { 'Content-Type': 'application/json' },
        data: {
          property: pID
        }
      }).then(function successCallback(response) {
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getSaved
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    // Get saved properties
    getSaved: function(pID) {
      if(!$rootScope['user']) {
        return new Promise(function(resolve, reject){
          resolve();
        })
      }
      return $http ({
        method  : 'GET',
        url     : BASE_URL+'users/'+$rootScope['user'].id+'/list/',
        headers :   { 'Content-Type': 'application/json' }
      }).then(function successCallback(response) {
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getAutocomplete
     * @param {string} typed Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    getAutocomplete: function(typed) {
      return $http ({
        method  : 'GET',
        url     : BASE_URL+'properties/search_location_ajax/?address='+typed,
        headers :   { 'Content-Type': 'application/json' }
      }).then(function successCallback(response) {
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },


    // BEGIN Share via email. Adrian
    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name shareViaEmail
     * @param {Object} Property info
     * @returns {Promise} The promise contains response info
     * @description
     *   Send a request to share property via email
     */
    shareViaEmail: function(params) {

      console.log("shareViaEmail called");

      return $http ({
        method  : 'GET',
        url     :  BASE_URL+'properties/share_via_email',
        headers :   { 'Content-Type': 'application/json' },
        params  : params
      }).then(function successCallback(response) {
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    // END Share via email


    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name searchAddress
     * @param {string} typed Provider name
     * @returns {Promise} The promise contains properties info
     * @description
     *   Get property of provided address or all the Properties for around provided address.
     */

    // START search engine:acris005@fiu.edu
    searchAddress: function(typed) {
      return $http ({
        method  : 'GET',
        url     : BASE_URL+'properties/?address='+typed,
        headers :   { 'Content-Type': 'application/json' }
      }).then(function successCallback(response) {
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },
    // END search engine

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getNeighborhoods
     * @param {string} typed Provider name
     * @returns {Promise} The promise contains neighours info
     * @description
     *   Get neighours ifo from provided location
     */

    getNeighborhoods: function(position, neighbortype) {
      var url = BASE_URL+'osm/neighbors/?lat='+position.lat + '&lng=' + position.lng+"&type=" + neighbortype + "&limit=100&offset=0"
      console.log(url)
      return $http ({
        method  : 'GET',
        url     : url,
        headers :   { 'Content-Type': 'application/json' }
      }).then(function successCallback(response) {
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    // START  property promotions Fernando Serrano

    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getByCondition
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the public Properties for a property.
     */
    getByCondition: function (con) {
      return $http({
        method  :   'GET',
        url     :   BASE_URL+'properties/'+con,
        headers :   { 'Content-Type': 'application/json' }
      }).then(function successCallback(response){
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     *
     * @param propertyFilter
     * @returns response
     * @description patches the filters used in the promote properties carousel
     */
    patchFilterList: function (propertyFilter) {
      return $http({
        method  :   'PATCH',
        data: propertyFilter,
        url     :   BASE_URL+'/propertyFilter/'+propertyFilter.id+'/',
        headers :   { 'Content-Type': 'application/json' }
      }).then(function successCallback(response){
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     *
     * @param propertyFilter
     * @returns response
     * @description adds a new filter for the promote properties carousel
     */

    addFilterList: function (propertyFilter) {
      return $http({
        method  :   'POST',
        data: propertyFilter,
        url     :   BASE_URL+'/propertyFilter/',
        headers :   { 'Content-Type': 'application/json' }
      }).then(function successCallback(response){
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
    },

    /**
     * @returns propertyFilters
     * @description returns all the filters used in the promote properties carousel and their order
     */
    getFiltered: function () {
      return $http({
        method  :   'GET',
        url     :   BASE_URL+'/propertyFilter/',
        headers :   { 'Content-Type': 'application/json' }
      }).then(function successCallback(response){
          return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        })
    },

    // END property promotions Fernando Serrano

    // START #2357 and #2487 Andreina Rojas aroja108@fiu.edu
    /**
     * @ngdoc method
     * @methodOf breazehomeDesktop.Properties
     * @name getAllFav
     * @param {string} provider Provider name
     * @returns {Promise} The promise contains user crendential
     * @description
     *   Get all the objects of favproperties
     */
     // Get all favproperties
     getAllFav: function () {
       return $http({
         method  :   'GET',
         url     :   BASE_URL+'favproperties/properties?puser='+$rootScope['user'].id+'&',
         headers :   { 'Content-Type': 'application/json' },
       }).then(function successCallback(response){
      	 return response;

       },
       function errorCallback(response) {
           throw new Error('Could not get response from server');
       });
     },

     isSaved: function(id){
  	   return $http({
             method  :   'GET',
             url     :   BASE_URL+'favproperties/isSaved?puser='+$rootScope['user'].id+'&pid='+id+'&',
             headers :   { 'Content-Type': 'application/json' },
           }).then(function successCallback(response){
          	 return response;

           },
           function errorCallback(response) {
               throw new Error('Could not get response from server');
           });
     },   

     /**
      * @ngdoc method
      * @methodOf breazehomeDesktop.Properties
      * @name getAllFav
      * @param {string} provider Provider name
      * @returns {Promise} The promise contains user crendential
      * @description
      *   Get all the objects of boards
      */
      // Get all boards
      getUserBoards: function () {
        return $http({
          method  :   'GET',
          url     :   BASE_URL+'boards/getUserBoards?puser='+$rootScope['user'].id+'&',
          headers :   { 'Content-Type': 'application/json' }
        }).then(function successCallback(response){
            return response;
        },
        function errorCallback(response) {
            throw new Error('Could not get response from server');
        });
      },

      /**
       * @ngdoc method
       * @methodOf breazehomeDesktop.Properties
       * @name getAllFav
       * @param {string} provider Provider name
       * @returns {Promise} The promise contains user crendential
       * @description
       *   unfavorite a property
       */
       getPropertiesInBoard: function (idObj) {
      	  return $http({
                method  :   'GET',
                url     :   BASE_URL+'boards/getPropertiesInBoard/?name='+idObj.name+'&',
                headers :   { 'Content-Type': 'application/json' }
              }).then(function successCallback(response){
                  return response;
              },
              function errorCallback(response) {
                  throw new Error('Could not get response from server');
              });
       },

       /**
        * @ngdoc method
        * @methodOf breazehomeDesktop.Properties
        * @name deletePropBoard
        * @param {string} provider Provider name
        * @returns {Promise} The promise contains user crendential
        * @description
        *   unfavorite a property
        */
        deletePropBoard: function (id, idObj) {
       	  return $http({
                 method  :   'GET',
                 url     :   BASE_URL+'boards/deletePropBoard/?name='+idObj.name+'&property='+id+'&puser='+$rootScope['user'].id+'&',
                 headers :   { 'Content-Type': 'application/json' }
               }).then(function successCallback(response){
                   return response;
               },
               function errorCallback(response) {
                   throw new Error('Could not get response from server');
               });
        },

      /**
       * @ngdoc method
       * @methodOf breazehomeDesktop.Properties
       * @name save
       * @param {string} provider Provider name
       * @returns {Promise} The promise contains user crendential
       * @description
       *   save property into favproperties
       */
       save: function(params) {
     	  return $http({
               method  :   'POST',
               url     :   BASE_URL+'favproperties/',
               headers :   { 'Content-Type': 'application/json' },
               data    :	{
             	  'user': $rootScope['user'].id,
             	  'property': params.id
               }
             }).then(function successCallback(response){
                 return response;
             },
             function errorCallback(response) {
                 throw new Error('Could not get response from server');
             });
       },

        /**
        * @ngdoc method
        * @methodOf breazehomeDesktop.Properties
        * @name save
        * @param {string} provider Provider name
        * @returns {Promise} The promise contains user crendential
        * @description
        *   save property into favproperties
        */
        boardsave: function(name,pid) {
      	  return $http({
                method  :   'POST',
                url     :   BASE_URL+'boards/',
                headers :   { 'Content-Type': 'application/json' },
                data    :	{
                 	  'name': name,
                 	  'user': $rootScope['user'].id,
                 	  'property': pid
                }
              }).then(function successCallback(response){
                  return response;
              },
              function errorCallback(response) {
                  throw new Error('Could not get response from server');
              });
        },
     /**
      * @ngdoc method
      * @methodOf breazehomeDesktop.Properties
      * @name getAllFav
      * @param {string} provider Provider name
      * @returns {Promise} The promise contains user crendential
      * @description
      *   unfavorite a property
      */
      unfavorite: function (id) {
        return $http({
          method  :   'GET',
          url     :   BASE_URL+'favproperties/unfavorite/?pid='+id+'&puser='+$rootScope['user'].id+'&',
          headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function successCallback(response){
            return response;
        },
        function errorCallback(response) {
            throw new Error('Could not get response from server');
        });
      },

      /**
      * @ngdoc method
      * @methodOf breazehomeDesktop.Properties
      * @name getNeighborhoods
      * @param {string} typed Provider name
      * @returns {Promise} The promise contains neighours info
      * @description
      *   Get all properties in specified ZIP/Postal Code
      */
      getNeighborsByPostal: function(postalCode){
        return $http ({
          method  : 'GET',
          url     : BASE_URL+'properties/?postal_code__icontains='+postalCode,
          headers :   { 'Content-Type': 'application/json' }
        }).then(function successCallback(response){
            return response;
        },
        function errorCallback(response) {
          throw new Error('Could not get response from server');
        });
      },
      
      /**
       * @ngdoc method
       * @methodOf breazehomeDesktop.Properties
       * @name getAllFav
       * @param {string} provider Provider name
       * @returns {Promise} The promise contains user crendential
       * @description
       *   unfavorite a property
       */
       deleteBoard: function (name,pid) {
         return $http({
           method  :   'GET',
           url     :   BASE_URL+'boards/deleteBoard/?name='+name+'&puser='+$rootScope['user'].id+'&pid='+pid+'&',
           headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
         }).then(function successCallback(response){
             return response;
         },
         function errorCallback(response) {
             throw new Error('Could not get response from server');
         });
       },

       /**
        * @ngdoc method
        * @methodOf breazehomeDesktop.Properties
        * @name getAllFav
        * @param {string} provider Provider name
        * @returns {Promise} The promise contains user crendential
        * @description
        *   unfavorite a property
        */
        rename: function (newname, name) {
          return $http({
            method  :   'GET',
            url     :   BASE_URL+'boards/rename/?newname='+newname+'&puser='+$rootScope['user'].id+'&name='+name+'&',
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
          }).then(function successCallback(response){
              return response;
          },
          function errorCallback(response) {
              throw new Error('Could not get response from server');
          });
        },

        // END #2357 and #2487 Andreina Rojas aroja108@fiu.edu

        // START Add Schools to Details Page Map:amoha083@fiu.edu
        /**
        * @ngdoc method
        * @methodOf breazehomeDesktop.Properties
        * @name getSchools 
        * @returns {data} Schools data
        * @description
        *   get data from Schools API
        */
        getSchools: function() {
          var url = BASE_URL+"schools/";
          return $http ({
            method : 'GET',
            url    : url,
            headers: {'Content-Type': 'application/json'}
          }).then(function successCallback(response) {
            return response;
          },
          function errorCallback(response) {
            throw new Error('Could not get response from server');
          });
        }
        // END Add Schools to Details Page Map:amoha083@fiu.edu

  };

});
