'use strict';

/*
 * @ngdoc controller
 * @name breazehomeDesktop.controller:ResultsCtrl
 * @description
 * # ResultsCtrl
 * Controller of the breazehomeDesktop
 */

angular.module('breazehomeDesktop').controller('ResultsCtrl', function ($scope, $localStorage, $document, Bilingual, Properties, Map, $rootScope, Lists, ModalService, toasts, $timeout, oauth, Users, Themes) {
	$('html, body').scrollTop(0);

  // START proximity search:acris005@fiu.edu

  // name: setupResultsMap
  // goal: initialize and setup results map for proximity search
  function setupResultsMap() {

    // if no properties to display use user's location as default origin
    if (!$scope.properties) {
      var position = Map.getUserGeolocation();
    } 
    
    // else use first property in results as origin point
    else {
      var firstProperty = $scope.properties[0]
      var position = Map.getPosition(firstProperty.locationPoint);
    }

    // initialize and create map
    Map.initResultsMap('map1', position);
  }
  setupResultsMap();

  // END proximity search
  

	// var userposition = Map.getUserGeolocation();
	// Map.MoveMapTo(Map.map, position);
	getCodeFromStorage();
	// ############## OAuth Methods ##############
	// Get Bilingual system
	$rootScope.storage = $localStorage;
	Bilingual.getLanguage('English');

    //BEGIN PoLR geocode and isochrone initialization
	$rootScope.PoLR = null;  //gets populated in Properties.getByFilter() when a PoLR search is detected.
	$rootScope.retrieveFilteredProperties = Properties.retrieveFilteredProperties;

    //END PoLR geocode and isochrone initialization
	// Check if redirected from Oauth, if so, post to API with given token to create user
	function getCodeFromStorage(){
	  let auth = JSON.parse(window.localStorage.getItem('auth'));
	  window.localStorage.removeItem('auth');
	  if(auth){
	    oauth.createUser(auth.code, auth.provider).then(res => {

	      // Check if account with this email already exists
	      if(res.status === 500){
	        $scope.registrationError = {error: ["A user with this email already exists"]};
	        ModalService.showModal({
	          templateUrl: "views/modals/registration-incorrect.html",
	          controller: "LandingCtrl",
	          scope: $scope
	        }).then(function(modal) {
	          modal.element.modal();
	          modal.close.then(function(result) {});
	        });
	      }

	      else {
	        // Set auth token and get user profile
	        Users.setAuthToken(res.data.key);
	        oauth.getUser().then(res => {
	          $rootScope.user = res.data;
	          window.location.href = "/#/results"
	        });
	      }
	    })
	  }
	}

	$scope.oauthLogin = function(provider){
	  oauth.authenticate(provider).then(res => {
	  })
	}

	// For Top Nav
	$rootScope.currentPage = "Results";

	// User personalization
	$scope.settings = {
		listView: 'card',
		selectedList: 0,
		properties: [],
        tag: {
            addedTag: false,
            newTag: '',
            editMode: false
        }
	}

	Users.getSavedSearches().then(res => {
		// console.log(res);
	});

	$scope.priceMin = 0;
	$scope.priceMax = 100000000;

 	let propertiesBusy = true;
 	let propertiesOffset = 0;

	// Get all properties from API
	// Properties.getAll().then(function(res){
	// 	$scope.properties = res.data;
	// 	propertiesBusy = false;
	// 	// console.log($scope.properties.results);
 //        Map.setProperties($scope.properties.results)
	// })
    
    
    //!Variables to be used with filtering dropdown actions!//
	$scope.filterHide = true;
	$scope.hideMore = true;
	$scope.moreFilterText = "More filters";

	$scope.expandFilter = function() {
		$scope.filterHide = false;
	}

    //!Handle a click!//
	$document.bind('click', function(e){
		// console.log($(e.target));
		// console.log($(".results-filter-dropdown")[0]);
		// console.log($(".results-filter-dropdown")[0].contains(e.target));
		// console.log($(".results-filter-button")[0].contains(e.target));
		// console.log(!$(".results-filter-dropdown")[0].contains(e.target) || !$(".results-filter-button")[0].contains(e.target));
		//
		// if ($(".results-filter-dropdown")[0].contains(e.target) || $(".results-filter-button")[0].contains(e.target)) {
		// 	$scope.$apply(function() {
		// 		$scope.filterHide = false;
		// 	});
		// }
		// else {
		// 	$scope.$apply(function() {
		// 		$scope.filterHide = true;
		// 	});
		// }
        
        //!Hide filtering dropdown menu if any clicking event occurs that is not on the dropdown open button, and also not anywhere on the dropdown if it is open.!//
        //!In addition, hide filtering dropdown menu when clicking on "apply filters" button or "close filter" button.!//
		if (!$(e.target).is(".results-filter-button") && !$(e.target).parents('.results-filter-dropdown').length || $(e.target).is("#apply.results-filter-header-button.col-md-3") || $(e.target).is("#close-filter")) {
			$scope.$apply(function() {
				$scope.filterHide = true;
			});
		}
		else {
			$scope.$apply(function() {
				$scope.filterHide = false;
			});
		}
	});

	// $scope.applyFilter = function() {
	// 	console.log("Apply filter");
	// }

    //!Handle more filters/less filter expansion behavior!//
	$scope.expandMore = function() {
		$scope.hideMore = $scope.hideMore?false:true;
		$scope.moreFilterText = $scope.hideMore?"More filters":"Less filters";
	}
    
    //START of Lester's filter code: #783 - lhern207@fiu.edu//
    //Filter code expands throughout the whole document//
    //It may include code for other features developed by other team members//
    
    //!Charts behavior and parameters for charts that currently only have place holders!//
    //!Price per sqft!//
    $scope.priceSqftChartLabels = [
     ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '
    ];
    $scope.priceSqftChartSeries = ['Series A']; //, 'Series B'];

    $scope.priceSqftChartData = [
     [65, 59, 80, 81, 56, 55, 40, 67, 100, 43, 0, 37, 45, 90, 101, 43, 67, 54, 43, 56]//,
     //[28, 48, 40, 19, 86, 27, 90]
    ];
    
    $scope.priceSqftChartColors = [{backgroundColor: '#135271', //borderColor 
                          //'#151B54', //backgroundColor
                          //'#151B54', 
                          //'#151B54'
                          }];
    
    $scope.priceSqftChartOptions = {scales: {
                                    yAxes: [{
                                        display: false,
                                        gridLines: {
                                            display:false
                                        }
                                    }],
                                    xAxes: [{
                                        display: false,
                                        categoryPercentage: 1.0,
                                        barPercentage: 1.0,
                                        gridLines: {
                                            display:false
                                        }
                                    }]
                                    },
                                    layout: {
                                        padding: {
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0
                                        }
                                    },
                                    tooltips: {
                                        enabled: false
                                    }
                                   };
    
    //!End of charts placeholders!//
    
    
    //!All filtering options text in dropdown!//
	$scope.filterTypes = [
		{ name: 'Apartment',	checked: false,    disabled: true },
		{ name: 'Condo', 		checked: true,     disabled: false },
		{ name: 'House',		checked: true,     disabled: false },
		{ name: 'Trailer',		checked: false,    disabled: true },
		{ name: 'Land',			checked: false,    disabled: true },
		{ name: 'Townhouse',	checked: false,    disabled: false },
		{ name: 'Other',		checked: false,    disabled: false }
	];
	$scope.filterTransType = [
		{ name: 'Sale',			   checked: false,     disabled: true },
		{ name: 'Rent', 		   checked: false,     disabled: true },
		{ name: 'Shared',		   checked: false,     disabled: true },
		{ name: 'Foreclosure',	   checked: false,     disabled: true },
		{ name: 'Sublet',		   checked: false,     disabled: true },
		{ name: 'Openhouses Only', checked: false,     disabled: false }  
	];
	$scope.filterFeatures = [
		{ name: 'Gym',			checked: false,             disabled: true },
		{ name: 'Pool', 		checked: false,             disabled: false },
		{ name: 'Laundry',		checked: false,             disabled: true },
		{ name: 'Parking Garage',	checked: false,         disabled: true },
		{ name: 'Street Parking',		checked: false,     disabled: true },
		{ name: 'Concierge',		checked: false,         disabled: true },
		{ name: 'Yard',		checked: false,                 disabled: true },
		{ name: 'Patio',		checked: false,             disabled: true },
		{ name: 'Balcony',		checked: false,             disabled: true },
		{ name: 'Waterfront',		checked: false,         disabled: true },
		{ name: 'Porch',		checked: false,             disabled: true },
		{ name: 'Wheelchair accessible',	checked: false, disabled: true }
	];
    $scope.sampleTags = [
        { name: '#Cool',			  checked: false,     disabled: true },
		{ name: '#Funny', 		      checked: false,     disabled: true },
		{ name: '#Nice Neighbors',    checked: false,     disabled: true },
		{ name: '#Noisy Street',	  checked: false,     disabled: true },
		{ name: '#Needs renovating',  checked: false,     disabled: true }
    ];

    
    //Disable a button based on disabled field value. Used for buttons generated with ng-repeat//
    $scope.isDisabled = function(button){
        if(button.disabled){
            return true;
        }
        return false;
    }
    
    //Show a tooltip message for disabled buttons
    $scope.showDisabledMessage = function(type){
        if(type.disabled == true){
            return 'Option Disabled';
        }
        else{
            return '';
        }
    }
    
	//Options used by search filter
    //!Setting and parameters for the different sliders on filters dropdown!//
	$scope.options = {
		squareMeters: {
		  min: 0,
		  max: 20000,
		  options: {
		    floor: 0,
		    ceil: 20000,
		    rightToLeft: ($rootScope.isFarsi === true),
		    step: 500,
            hidePointerLabels: true,
            hideLimitLabels: true
		  }
		},
		livingArea: {
		  min: 0,
		  max: 20000,
		  options: {
		    floor: 0,
		    ceil: 20000,
		    rightToLeft: ($rootScope.isFarsi === true),
		    step: 500,
            hidePointerLabels: true,
            hideLimitLabels: true
		  }
		},
		totalPrice: {
		  min:  0,
		  max:  1000,
		  options: {
		    floor: 0,
		    ceil: 1000,
		    step: 10,
		    hidePointerLabels: true,
		    hideLimitLabels: true,
		    translate: function(value) {
		      if(value < 1000) {
		      	return value;
		      }
		      else if(value >= 1000 && value < 1000000) {
		        return value / 1000 + 'K';
		      }
		      else if (value >= 1000000){
		        return value / 1000000 + 'M';
		      }
		    }
		  }
		},
        pricePerArea: {
          min: 0,
          max: 1000,
          options: {
              floor: 0,
              ceil: 1000,
              rightToLeft: ($rootScope.isFarsi === true),
              step: 10,
              hidePointerLabels: true,
              hideLimitLabels: true
          }
        },
		parking: {
		  enabled: false
		},
		storage: {
		  enabled: false
		},
		elevator: {
		  enabled: false
		},
		pool: {
		  enabled: false
		},
		bedrooms: {
		  min: 1,
          max: 8,
          options: {
              floor: 1,
              ceil: 8,
              rightToLeft: ($rootScope.isFarsi === true),
              step: 1,
              hidePointerLabels: true,
              hideLimitLabels: true
          }
		},
        bathrooms: {
          min: 1,
          max: 7,
          options: {
              floor: 1,
              ceil: 7,
              rightToLeft: ($rootScope.isFarsi === true),
              step: 1,
              hidePointerLabels: true,
              hideLimitLabels: true
          } 
        },
		floorNum: {
		  min: 0,
		  max: 20,
		  options: {
		    floor: 0,
		    ceil: 20,
		    rightToLeft: ($rootScope.isFarsi === true)

		  }
		},
		buildingAge: {
		  min: 0,
		  max: 50,
		  options: {
		    floor: 0,
		    ceil: 50,
		    rightToLeft: ($rootScope.isFarsi === true),
            hidePointerLabels: true,
            hideLimitLabels: true
		  }
		},
		requestType: {
		  rent: {
		    value: true,
		    id: 2
		  },
		  deposit: {
		    value: true,
		    id: 3
		  },
		  sale: {
		    value: true,
		    id: 1
		  },
		  exchange: {
		    value: true,
		    id: 5
		  },
		  collaborative: {
		    value: true,
		    id: 4
		  },
		  unknown: {
		    value: true,
		    id: 6
		  },
		},
		requestData: ''
	};
    
    //!Syncing slider to dropdowns code!//
    $scope.selectedMinBedrooms = "1";
    $scope.selectedMaxBedrooms = "8+";
    
    $scope.selectedMinBathrooms = "1";
    $scope.selectedMaxBathrooms = "4+";
    
    //!Bedrooms syncing!//
    $scope.$watch('selectedMinBedrooms', function(){
        if ($scope.selectedMinBedrooms == "8+") {
            $scope.options.bedrooms.min = 8;
        }
        else{
            $scope.options.bedrooms.min = parseInt($scope.selectedMinBedrooms);
        }
    });
    
    $scope.$watch('options.bedrooms.min', function(){
        if ($scope.options.bedrooms.min == 8){
            $scope.selectedMinBedrooms = $scope.options.bedrooms.min + "+";
        }
        else{
            $scope.selectedMinBedrooms = $scope.options.bedrooms.min + "";
        }
    });
    
    $scope.$watch('selectedMaxBedrooms', function(){
        if ($scope.selectedMaxBedrooms == "8+") {
            $scope.options.bedrooms.max = 8;
        }
        else{
            $scope.options.bedrooms.max = $scope.selectedMaxBedrooms;
        }
    });
    
    $scope.$watch('options.bedrooms.max', function(){
        if ($scope.options.bedrooms.max == 8){
            $scope.selectedMaxBedrooms = $scope.options.bedrooms.max + "+";
        }
        else{
            $scope.selectedMaxBedrooms = $scope.options.bedrooms.max + "";
        }
    });
    
    //!Bathrooms syncing!//
    
    $scope.$watch('selectedMinBathrooms', function(){
        if ($scope.selectedMinBathrooms == "4+") {
            $scope.options.bathrooms.min = 7;
        }
        else{
            $scope.options.bathrooms.min = parseFloat($scope.selectedMinBathrooms)*2 - 1;
        }
    });
    
    $scope.$watch('options.bathrooms.min', function(){
        if ($scope.options.bathrooms.min == 7){
            $scope.selectedMinBathrooms = (($scope.options.bathrooms.min + 1)/2) + "+";
        }
        else{
            $scope.selectedMinBathrooms = (($scope.options.bathrooms.min + 1)/2) + "";
        }
    });
    
    $scope.$watch('selectedMaxBathrooms', function(){
        if ($scope.selectedMaxBathrooms == "4+") {
            $scope.options.bathrooms.max = 7;
        }
        else{
            $scope.options.bathrooms.max = parseFloat($scope.selectedMaxBathrooms)*2 - 1;
        }
    });
    
    $scope.$watch('options.bathrooms.max', function(){
        if ($scope.options.bathrooms.max == 7){
            $scope.selectedMaxBathrooms = (($scope.options.bathrooms.max + 1)/2) + "+";
        }
        else{
            $scope.selectedMaxBathrooms = (($scope.options.bathrooms.max + 1)/2) + "";
        }
    });
    
    //!End of dropdown and slider syncing code!//
    
    
    //!Start of Select/Deselect all behavior!//
    //!Property Types!//
    $scope.propertyTypeSelectAllText = "select all";
    $scope.propertyTypeAllSelected = false;
    
    $scope.propertyTypeSelectOne = function(){
        $scope.propertyTypeAllSelected = true;
        for(var i=0; i < $scope.filterTypes.length; i++){
            if($scope.filterTypes[i].checked != true){
                $scope.propertyTypeAllSelected = false;
                break;
            }
        }
        if($scope.propertyTypeAllSelected == true){
            $scope.propertyTypeSelectAllText = "deselect all";
        }
        else{
            $scope.propertyTypeSelectAllText = "select all";
        }
    }
    
    $scope.propertyTypeSelectAllAction = function(){
        if($scope.propertyTypeSelectAllText == "select all"){
            for(var i=0; i < $scope.filterTypes.length; i++){
                if($scope.filterTypes[i].disabled == false){
                    $scope.filterTypes[i].checked = true;
                }
            } 
            $scope.propertyTypeAllSelected = true;
            $scope.propertyTypeSelectAllText = "deselect all"
        }
        else{
            for(var i=0; i < $scope.filterTypes.length; i++){
                if($scope.filterTypes[i].disabled == false){
                    $scope.filterTypes[i].checked = false;
                }
            } 
            $scope.propertyTypeAllSelected = false;
            $scope.propertyTypeSelectAllText = "select all"
        }
    }
    
    //!Listing Types!//
    $scope.listingTypeSelectAllText = "select all";
    $scope.listingTypeAllSelected = false;
    
    $scope.listingTypeSelectOne = function(){
        $scope.listingTypeAllSelected = true;
        for(var i=0; i < $scope.filterTransType.length; i++){
            if($scope.filterTransType[i].checked != true){
                $scope.listingTypeAllSelected = false;
                break;
            }
        }
        if($scope.listingTypeAllSelected == true){
            $scope.listingTypeSelectAllText = "deselect all";
        }
        else{
            $scope.listingTypeSelectAllText = "select all";
        }
    }
    
    $scope.listingTypeSelectAllAction = function(){
        if($scope.listingTypeSelectAllText == "select all"){
            for(var i=0; i < $scope.filterTransType.length; i++){
                if($scope.filterTransType[i].disabled == false){
                    $scope.filterTransType[i].checked = true;
                }
            } 
            $scope.listingTypeAllSelected = true;
            $scope.listingTypeSelectAllText = "deselect all"
        }
        else{
            for(var i=0; i < $scope.filterTransType.length; i++){
                if($scope.filterTransType[i].disabled == false){
                    $scope.filterTransType[i].checked = false;
                }
            } 
            $scope.listingTypeAllSelected = false;
            $scope.listingTypeSelectAllText = "select all"
        }
    
    }
    
    //!Tags!//
    $scope.tagsSelectAllText = "select all";
    $scope.tagsAllSelected = false;
    
    $scope.tagsSelectOne = function(){
        $scope.tagsAllSelected = true;
        for(var i=0; i < $scope.sampleTags.length; i++){
            if($scope.sampleTags[i].checked != true){
                $scope.tagsAllSelected = false;
                break;
            }
        }
        if($scope.tagsAllSelected == true){
            $scope.tagsSelectAllText = "deselect all";
        }
        else{
            $scope.tagsSelectAllText = "select all";
        }
    }
    
    $scope.tagsSelectAllAction = function(){
        if($scope.tagsSelectAllText == "select all"){
            for(var i=0; i < $scope.sampleTags.length; i++){
                if($scope.sampleTags[i].disabled == false){
                    $scope.sampleTags[i].checked = true;
                }
            } 
            $scope.tagsAllSelected = true;
            $scope.tagsSelectAllText = "deselect all"
        }
        else{
            for(var i=0; i < $scope.sampleTags.length; i++){
                if($scope.sampleTags[i].disabled == false){
                    $scope.sampleTags[i].checked = false;
                }
            } 
            $scope.tagsAllSelected = false;
            $scope.tagsSelectAllText = "select all"
        }
    }
    
    //!Features!//
    $scope.featuresSelectAllText = "select all";
    $scope.featuresAllSelected = false;
    
    $scope.featuresSelectOne = function(){
        $scope.featuresAllSelected = true;
        for(var i=0; i < $scope.filterFeatures.length; i++){
            if($scope.filterFeatures[i].checked != true){
                $scope.featuresAllSelected = false;
                break;
            }
        }
        if($scope.featuresAllSelected == true){
            $scope.featuresSelectAllText = "deselect all";
        }
        else{
            $scope.featuresSelectAllText = "select all";
        }
    }
    
    $scope.featuresSelectAllAction = function(){
        if($scope.featuresSelectAllText == "select all"){
            for(var i=0; i < $scope.filterFeatures.length; i++){
                if($scope.filterFeatures[i].disabled == false){
                    $scope.filterFeatures[i].checked = true;
                }
            } 
            $scope.featuresAllSelected = true;
            $scope.featuresSelectAllText = "deselect all"
        }
        else{
            for(var i=0; i < $scope.filterFeatures.length; i++){
                if($scope.filterFeatures[i].disabled == false){
                    $scope.filterFeatures[i].checked = false;
                }
            } 
            $scope.featuresAllSelected = false;
            $scope.featuresSelectAllText = "select all"
        }
    }
    //!End of Select/Deselect all behavior!//

    //!Define card hover behavior!//
	function addCardHoverListener(){
		const cards = Array.from(document.querySelectorAll('.card-wrapper'));
		//console.log(cards)
		cards.forEach(card => {
			card.addEventListener('mouseover', e => {
				//console.log(e);
				const save = card.getElementsByClassName('card-save')[0];
				save.style.top = '7px';
			})
		})
	}

    //!Some date elements!//
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var currentMonth = currentDate.getMonth() + 1;
    var currentDay = currentDate.getDate();
    
    //!Filter structure and some starting values!//
 	var filter = {};
    filter.condo = true;
    filter.house = true;
    filter.priceMin = 0;
    filter.priceMax = 1000000000;
    filter.bedsMin = "1";
    filter.bedsMax = "8+";
    filter.bathsMin = "1";
    filter.bathsMax = "4+";
    filter.price_per_sqft_min = 0;
    filter.price_per_sqft_max = 10000000;
    filter.year_built_min = currentYear - 400;
    filter.year_built_max = currentYear;
    filter.size_living_area_min = 0;
    filter.size_living_area_max = 100000000;
    filter.size_lot_min = 0;
    filter.size_lot_max = 100000000;
    
    //!?!//
 	var parsedAddress = Properties.getSearch();

  // START refinement search:acris005@fiu.edu

  // name: addressSearch
  // goal: add search engine behavior to results page
  $scope.addressSearch = function() {
      if ($scope.searchInput.replace(/\s/g, '').length) {
          var address = $scope.searchInput;
          $scope.properties = Properties.searchAddress(address);

          $scope.properties.then(function(res) {
              $rootScope.properties = res.data.results;
              $rootScope.addrSearchFlag = "yes";
              getPropertiesByFilter(filter);

              if ($rootScope.properties.length > 0) {
                var firstProperty = $rootScope.properties[0];
                var position = Map.getPosition(firstProperty.locationPoint);
                Map.moveCurrentMapTo(position);
              }
          })
      }
  }
  // END refinement search

  //!Handles filter application behavior!//
        //Ashif , Openhouse made changes to include openhouse in the filter if openhouse only was clcked
 	$scope.applyFilter = function() {
 	    //BEGIN PoLR UI Parameter Collection and Validation
		if($scope.commute.day != undefined || $scope.commute.time != null || ($scope.commute.minutes != undefined && $scope.commute.minutes != NaN) || $scope.commute.type != undefined)  {  //then the user has selected one or more of the PoLR search options
		    // SETTINGS.VERBOSE_CONSOLE_DEBUG ? console.log("applyFilter() -> PoLR Search has been invoked!  searchInput == [%s], commute.day == [%s], commute.time == [%s], commute.minutes == [%d], commute.type == [%s]", $scope.searchInput, $scope.commute.day, $scope.commute.time, $scope.commute.minutes, $scope.commute.type) : null;

		    if(!$scope.searchInput || $scope.commute.day == undefined || $scope.commute.time == null || $scope.commute.minutes == undefined || $scope.commute.minutes == NaN || $scope.commute.type == undefined)  {  //must have searchInput, commute.day, commute.time, and commute.minutes to run a PoLR search

		        $scope.searchError = [["A commute time search must specify a search address, day of the week, time of the day, commute time and commute type."]];
		        ModalService.showModal({
		           templateUrl: "views/modals/login-incorrect.html",
		           controller: "ResultsCtrl",
		           scope: $scope
		        }).then(function(modal) {
		            modal.element.modal();
		            modal.close.then(function(result) {});
		        });

		        return;  //if we don't have them all, throw the search back out to the user for correction
		    }

		    filter.searchInput = $scope.searchInput;
		    filter.commuteDay = $scope.commute.day;
		    filter.commuteTime= $scope.commute.time;
		    filter.commuteMinutes = $scope.commute.minutes;
			filter.commuteType= $scope.commute.type;

		}

 	    //END PoLR UI Parameter Collection and Validation
        
        //!Filters for openhouse and price have been defined!//
        
        if ($scope.options.totalPrice.min === 0 && $scope.options.totalPrice.max === 1000) {
            $scope.priceSet = false;
        }
        else{
            filter.priceMin = $scope.options.totalPrice.min*1000;
            filter.priceMax = $scope.options.totalPrice.max*1000;
            $scope.priceSet = true;
            //To avoid changing shown filter values on dropdown button before filters are actually applied.
            $scope.currentPriceMin = $scope.options.totalPrice.min;
            $scope.currentPriceMax = $scope.options.totalPrice.max;
        }
        
        if($scope.filterTransType[5].checked){//If openhouse was checked on filters pane reinitialize map and 
            filter.openhouse = true;
            $scope.isOpen = true;  
        }
        else{
            filter.openhouse = false;
            $scope.isOpen = false;
        }
        //!Other filters!//
        //!Property type filter fields!//
        
        if ($scope.filterTypes[0].checked){
            filter.apartment = true;
        }
        else{
            filter.apartment = false;
        }
        
        if ($scope.filterTypes[1].checked){
            filter.condo = true;
        }
        else{
            filter.condo = false;
        }
        
        if ($scope.filterTypes[2].checked){
            filter.house = true;
        }
        else{
            filter.house = false;
        }
        
        if ($scope.filterTypes[3].checked){
            filter.trailer = true;
        }
        else{
            filter.trailer = false;
        }
        
        if ($scope.filterTypes[4].checked){
            filter.land = true;
        }
        else{
            filter.land = false;
        }
        
        if ($scope.filterTypes[5].checked){
            filter.townhouse = true;
        }
        else{
            filter.townhouse = false;
        }
        
        if ($scope.filterTypes[6].checked){
            filter.other = true;
        }
        else{
            filter.other = false;
        }
        
        //!Beds!//
        if ($scope.selectedMinBedrooms == "1" && $scope.selectedMaxBedrooms == "8+") {
            $scope.bedroomsSet = false;
        }
        else{
            $scope.bedroomsSet = true;
        }
        filter.beds_min = $scope.selectedMinBedrooms;
        $scope.currentMinBedrooms = $scope.selectedMinBedrooms;
        filter.beds_max = $scope.selectedMaxBedrooms;
        $scope.currentMaxBedrooms = $scope.selectedMaxBedrooms;
        
        
        //!Baths!//
        if ($scope.selectedMinBathrooms == "1" && $scope.selectedMaxBathrooms == "4+") {
            $scope.bathroomsSet = false;
        }
        else{
            $scope.bathroomsSet = true;
        }
        filter.baths_min = $scope.selectedMinBathrooms;
        $scope.currentMinBathrooms = $scope.selectedMinBathrooms;
        filter.baths_max = $scope.selectedMaxBathrooms;
        $scope.currentMaxBathrooms = $scope.selectedMaxBathrooms;
        
        //!Listing type filters!//
        if ($scope.filterTransType[0].checked){
            filter.sale = true;
        }
        else{
            filter.sale = false;
        }
        
        if ($scope.filterTransType[1].checked){
            filter.rent = true;
        }
        else{
            filter.rent = false;
        }
        
        if ($scope.filterTransType[2].checked){
            filter.shared = true;
        }
        else{
            filter.shared = false;
        }
        
        if ($scope.filterTransType[3].checked){
            filter.foreclosure = true;
        }
        else{
            filter.foreclosure = false;
        }
        
        if ($scope.filterTransType[4].checked){
            filter.sublet = true;
        }
        else{
            filter.sublet = false;
        }
        
        //!Price per sqft filters!//
        if ($scope.options.pricePerArea.min != 0 || $scope.options.pricePerArea.max != 1000) {
            filter.price_per_sqft_min = $scope.options.pricePerArea.min;
            filter.price_per_sqft_max = $scope.options.pricePerArea.max;
        }
        
        //!Features and amenities filters!//
        if ($scope.filterFeatures[0].checked){
            filter.gym = true;
        }
        else{
            filter.gym = false;
        }
        
        if ($scope.filterFeatures[1].checked){
            filter.pool = true;
        }
        else{
            filter.pool = false;
        }
        
        if ($scope.filterFeatures[2].checked){
            filter.laundry = true;
        }
        else{
            filter.laundry = false;
        }
        
        if ($scope.filterFeatures[3].checked){
            filter.parking_garage = true;
        }
        else{
            filter.parking_garage = false;
        }
        
        if ($scope.filterFeatures[4].checked){
            filter.street_parking = true;
        }
        else{
            filter.street_parking = false;
        }
        
        if ($scope.filterFeatures[5].checked){
            filter.concierge = true;
        }
        else{
            filter.concierge = false;
        }
        
        if ($scope.filterFeatures[6].checked){
            filter.yard = true;
        }
        else{
            filter.yard = false;
        }
        
        if ($scope.filterFeatures[7].checked){
            filter.patio = true;
        }
        else{
            filter.patio = false;
        }
        
        if ($scope.filterFeatures[8].checked){
            filter.balcony = true;
        }
        else{
            filter.balcony = false;
        }
        
        if ($scope.filterFeatures[9].checked){
            filter.waterfront = true;
        }
        else{
            filter.waterfront = false;
        }
        
        if ($scope.filterFeatures[10].checked){
            filter.porch = true;
        }
        else{
            filter.porch = false;
        }
        
        if ($scope.filterFeatures[11].checked){
            filter.wheelchair_accessible = true;
        }
        else{
            filter.wheelchair_accessible = false;
        }
        
        //!Year built filters!//
        if ($scope.options.buildingAge.min != 0 || $scope.options.buildingAge.max != 50) {
            filter.year_built_min = currentYear - $scope.options.buildingAge.max;
            filter.year_built_max = currentYear - $scope.options.buildingAge.min;
        }
        
        //!Living area size filters!//
        if ($scope.options.livingArea.min != 0 || $scope.options.livingArea.max != 20000) {
            filter.size_living_area_min = $scope.options.livingArea.min;
            filter.size_living_area_max = $scope.options.livingArea.max;
        }
        
        //!Lot size filter!//
        if ($scope.options.squareMeters.min != 0 || $scope.options.squareMeters.max != 20000) {
            filter.size_lot_min = $scope.options.squareMeters.min;
            filter.size_lot_max = $scope.options.squareMeters.max;
        }
        
        filter.last_updated = $scope.selectedUpdateTime;
        
        
        /*console.log(currentMonth);
        if(currentMonth == "7"){
            console.log("It works");
        }*/
        
            
        getPropertiesByFilter(filter);	
        processCharts(filter);
	}
    
    $scope.resetFilter = function() {
        //Reset PoLR filters and scope variables.
        filter.searchInput = undefined;
        $scope.searchInput = undefined;
        filter.commuteDay = undefined;
        $scope.commute.day = undefined;
        filter.commuteTime = undefined;
        $scope.commute.time = null;
        filter.commuteMinutes = undefined;
        $scope.commute.minutes = undefined;
        filter.commuteType = undefined;
        $scope.commute.type = undefined;
        
        $scope.filterTransType[5].checked = false;
        filter.openhouse = false;
        $scope.isOpen = false;
        
        filter.priceMin = 0;
        $scope.options.totalPrice.min = 0;
		filter.priceMax = 1000000000;
        $scope.options.totalPrice.max = 1000;
        $scope.priceSet = false;
       
        
        $scope.filterTypes[0].checked = false;
        filter.apartment = false;
        
        $scope.filterTypes[1].checked = true;
        filter.condo = true;
        
        $scope.filterTypes[2].checked = true;
        filter.house = true;
        
        $scope.filterTypes[3].checked = false;
        filter.trailer = false;
        
        $scope.filterTypes[4].checked = false;
        filter.land = false;
        
        $scope.filterTypes[5].checked = false;
        filter.townhouse = false;
        
        $scope.filterTypes[6].checked = false;
        filter.other = false;

        //!Beds!//
        filter.beds_min = "1";
        $scope.selectedMinBedrooms = "1";
        $scope.currentMinBedrooms = "1";
        filter.beds_max = "8+";
        $scope.selectedMaxBedrooms = "8+";
        $scope.currentMaxBedrooms = "8+";
        $scope.bedroomsSet = false;
        
        //!Baths!//
        filter.baths_min = "1";
        $scope.selectedMinBathrooms = "1";
        $scope.currentMinBathrooms = "1";
        filter.baths_max = "4+";
        $scope.selectedMaxBathrooms = "4+";
        $scope.currentMaxBathrooms = "4+";
        $scope.bathroomsSet = false;
        
        //!Listing type filters!//
        $scope.filterTransType[0].checked = false;
        filter.sale = false;
        
        $scope.filterTransType[1].checked = false;
        filter.rent = false;
        
        $scope.filterTransType[2].checked = false;
        filter.shared = false;

        $scope.filterTransType[3].checked = false;
        filter.foreclosure = false;
        
        $scope.filterTransType[4].checked = false;
        filter.sublet = false;
        
        //!Price per sqft filters!//
        filter.price_per_sqft_min = 0;
        $scope.options.pricePerArea.min = 0;
        filter.price_per_sqft_max = 1000000000;
        $scope.options.pricePerArea.max = 1000;
        
        $scope.filterFeatures[0].checked = false;
        filter.gym = false;
        
        $scope.filterFeatures[1].checked = false;
        filter.pool = false;
  
        $scope.filterFeatures[2].checked = false;
        filter.laundry = false;
        
        $scope.filterFeatures[3].checked = false;
        filter.parking_garage = false;
        
        $scope.filterFeatures[4].checked = false;
        filter.street_parking = false;
        
        $scope.filterFeatures[5].checked = false;
        filter.concierge = false;
        
        $scope.filterFeatures[6].checked = false;
        filter.yard = false;
        
        $scope.filterFeatures[7].checked = false;
        filter.patio = false;
        
        $scope.filterFeatures[8].checked = false;
        filter.balcony = false;
        
        $scope.filterFeatures[9].checked = false;
        filter.waterfront = false;
        
        $scope.filterFeatures[10].checked = false;
        filter.porch = false;
        
        $scope.filterFeatures[11].checked = false;
        filter.wheelchair_accessible = false;
        
        $scope.sampleTags[0].checked = false;
        $scope.sampleTags[1].checked = false;
        $scope.sampleTags[2].checked = false;
        $scope.sampleTags[3].checked = false;
        $scope.sampleTags[4].checked = false;
        
        //!Year built filters!//
        filter.year_built_min = currentYear - 400;
        $scope.options.buildingAge.max = 50;
        filter.year_built_max = currentYear;
        $scope.options.buildingAge.min = 0;
        
        //!Living area size filters!//
        filter.size_living_area_min = 0;
        $scope.options.livingArea.min = 0;
        filter.size_living_area_max = 100000000;
        $scope.options.livingArea.max = 20000;
        
        //!Lot size filter!//
        filter.size_lot_min = 0;
        $scope.options.squareMeters.min = 0;
        filter.size_lot_max = 1000000000;
        $scope.options.squareMeters.max = 20000;
        
        filter.last_updated = null;
        $scope.selectedUpdateTime = null;
        
        getPropertiesByFilter(filter);
        processCharts(filter);

    }

 	var getPropertiesByFilter = function(filter) {
 		// console.log("What is the filter used by getPropertiesByFilter? ");
 		// Properties.getByFilter(filter, "").then(function(res){
 		// 	console.log("!!!!!", res)
 		// Properties.getByFilter(filter, Map.getMapBounds()).then(function(res){
	        // Get all user's saves homes(recover from 6aaaa58bad)
	   //      Properties.getSaved().then(function(res){
				// console.log(res);
				// if(res.data.results.length > 0) {
				// 	const savedProperties = res.data.results[0].propertyObjects;
				// 	// Check if any property in view is already saved by the user
				// 	for(let i = 0; i < savedProperties.length; i++){
				// 		for(let j = 0; j < $scope.properties.length; j++){
				// 			if(savedProperties[i].id === $scope.properties[j].id){
				// 				$scope.properties[j].saved = true;
				// 				break;
				// 			}
				// 		}
		  //        	}
	   //      	}
	   //      });


        //!Call getByFilter() properties service with current filter object and current map bounds.!//
        //!getByFilter() then usually calls retrieveFilteredProperties() on the same properties service. Unless, search address input or commute filter have been used, in which case behavior is different (PoLR - Check properties service). A database query is made via http, a response is chained back to here as a return of both properties service methods.!//
        //!then() is called inmediately after. res is the response object returned by getByFiler(). We can access the list of properties via res.data.results!//
 		Properties.getByFilter(filter, Map.getMapBounds()).then(function(res){
 		// Properties.getByPolygon(Map.getMapBounds()).then(function(res){

            $scope.properties = res.data.results;
            $scope.totalCount = res.data.count;
            
            //console.log(res);
            
            if($rootScope.addrSearchFlag !== undefined) {
                $scope.properties = $rootScope.properties;
                //console.log($scope.properties);
            }

            for(var i in $scope.properties) {
                $scope.properties[i].visible = true;
            }

            Map.addPropertiesIntoClusters($scope.properties);
			// console.log("getPropertiesByFilter",$scope.properties);
			Map.clearAllPropertiesLayer();
			Map.geoAddress();  //BEGIN PoLR (Juan) map layer injection
			Map.addPropertiesIntoClusters($scope.properties);
		});
        
        
 	}
    
    var processCharts = async function(filter) {
        $scope.applyButtonText = "Populating Charts...";
        $scope.applyButtonDisabled = true;
        
        //!Call functions to retrieve data and populate charts!//
        $scope.chartData = await getPriceChartCounts(filter);
        $scope.priceCount = countArray($scope.chartData);
        $scope.normalizedData = valueNormalization($scope.chartData);
        populatePriceChart();
        
        $scope.chartData = await getBedsChartCounts(filter);
        $scope.bedsCount = countArray($scope.chartData);
        $scope.normalizedData = valueNormalization($scope.chartData);
        populateBedsChart();
        
        $scope.chartData = await getBathsChartCounts(filter);
        $scope.bathsCount = countArray($scope.chartData);
        $scope.normalizedData = valueNormalization($scope.chartData);
        populateBathsChart();
        
        //Placeholder code for not yet implemented Price per Sqft charts//
        /*
        $scope.chartData = await getPriceSqftChartCounts(filter);
        $scope.priceSqftCount = countArray($scope.chartData);
        $scope.normalizedData = valueNormalization($scope.chartData);
        populatePriceSqftChart();
        */
        
        $scope.chartData = await getYearBuiltChartCounts(filter);
        $scope.yearBuiltCount = countArray($scope.chartData);
        $scope.normalizedData = valueNormalization($scope.chartData);
        populateYearBuiltChart();
        
        $scope.chartData = await getLivingAreaChartCounts(filter);
        $scope.livingAreaCount = countArray($scope.chartData);
        $scope.normalizedData = valueNormalization($scope.chartData);
        populateLivingAreaChart();
        
        $scope.chartData = await getLotSizeChartCounts(filter);
        $scope.lotSizeCount = countArray($scope.chartData);
        $scope.normalizedData = valueNormalization($scope.chartData);
        populateLotSizeChart();
            
        //!Placeholder for counts of each filter type with current placeholder charts!//
        $scope.priceSqftCount = $scope.priceCount;
        
        //!Allow user to "Apply filters" again!//
        updateApplyButton();
    }
    
    
    //!Start of functions to retrieve chart data!//
    //!Retrieve data for for all Charts by repeatedly querying backend api!//
    //!Temporary solution!. Slow!//
    var getPriceChartCounts = async function(filter) {
        var startPriceMin = filter.priceMin;
        var startPriceMax = filter.priceMax;
        var startBedsMin = filter.beds_min;
        var startBedsMax = filter.beds_max;
        var startBathsMin = filter.baths_min;
        var startBathsMax = filter.baths_max;
        var startPricePerSqftMin = filter.price_per_sqft_min;
        var startPricePerSqftMax = filter.price_per_sqft_max;
        var startYearBuiltMin = filter.year_built_min;
        var startYearBuiltMax = filter.year_built_max;
        var startLivingAreaMin = filter.size_living_area_min;
        var startLivingAreaMax = filter.size_living_area_max;
        var startLotSizeMin = filter.size_lot_min;
        var startLotSizeMax = filter.size_lot_max;
        
        filter.priceMin = 0;
        filter.priceMax = 100000;
        var chartIntervals = [];
        
        for (var i = 0; i < 10; i++) {
            while(startBedsMin != filter.beds_min || startBedsMax != filter.beds_max ||
                  startBathsMin != filter.baths_min || startBathsMax != filter.baths_max ||
                  startPricePerSqftMin != filter.price_per_sqft_min || startPricePerSqftMax != filter.price_per_sqft_max || 
                  startYearBuiltMin != filter.year_built_min || startYearBuiltMax != filter.year_built_max || 
                  startLivingAreaMin != filter.size_living_area_min || startLivingAreaMax != filter.size_living_area_max || 
                  startLotSizeMin != filter.size_lot_min || startLotSizeMax != filter.size_lot_max){}
            
            var response = await Properties.getByFilter(filter, Map.getMapBounds());
            chartIntervals.push(response.data.count);
            filter.priceMin = filter.priceMin + 100000;
            filter.priceMax = filter.priceMax + 100000;
        }
        
        filter.priceMin = startPriceMin;
        filter.priceMax = startPriceMax;
        //console.log(chartIntervals.length);
        //console.log(chartIntervals);
        //console.log(chartIntervals[3]);
        
        return chartIntervals;
    }
   
    var getBedsChartCounts = async function(filter) {
        var startPriceMin = filter.priceMin;
        var startPriceMax = filter.priceMax;
        var startBedsMin = filter.beds_min;
        var startBedsMax = filter.beds_max;
        var startBathsMin = filter.baths_min;
        var startBathsMax = filter.baths_max;
        var startPricePerSqftMin = filter.price_per_sqft_min;
        var startPricePerSqftMax = filter.price_per_sqft_max;
        var startYearBuiltMin = filter.year_built_min;
        var startYearBuiltMax = filter.year_built_max;
        var startLivingAreaMin = filter.size_living_area_min;
        var startLivingAreaMax = filter.size_living_area_max;
        var startLotSizeMin = filter.size_lot_min;
        var startLotSizeMax = filter.size_lot_max;
        
        filter.beds_min = 1;
        filter.beds_max = 2;
        var chartIntervals = [];
        
        for (var i = 0; i < 7; i++) {
            while(startPriceMin != filter.priceMin || startPriceMax != filter.priceMax ||
                  startBathsMin != filter.baths_min || startBathsMax != filter.baths_max ||
                  startPricePerSqftMin != filter.price_per_sqft_min || startPricePerSqftMax != filter.price_per_sqft_max || 
                  startYearBuiltMin != filter.year_built_min || startYearBuiltMax != filter.year_built_max ||
                  startLivingAreaMin != filter.size_living_area_min || startLivingAreaMax != filter.size_living_area_max ||
                  startLotSizeMin != filter.size_lot_min || startLotSizeMax != filter.size_lot_max){}
            
            var response = await Properties.getByFilter(filter, Map.getMapBounds());
            chartIntervals.push(response.data.count);
            filter.beds_min = filter.beds_min + 1;
            filter.beds_max = filter.beds_max + 1;
        }
        
        filter.beds_min = startBedsMin;
        filter.beds_max = startBedsMax;
        //console.log(chartIntervals.length);
        //console.log(chartIntervals);
        //console.log(chartIntervals[3]);
        
        return chartIntervals;
    }
    
    var getBathsChartCounts = async function(filter) {
        var startPriceMin = filter.priceMin;
        var startPriceMax = filter.priceMax;
        var startBedsMin = filter.beds_min;
        var startBedsMax = filter.beds_max;
        var startBathsMin = filter.baths_min;
        var startBathsMax = filter.baths_max;
        var startPricePerSqftMin = filter.price_per_sqft_min;
        var startPricePerSqftMax = filter.price_per_sqft_max;
        var startYearBuiltMin = filter.year_built_min;
        var startYearBuiltMax = filter.year_built_max;
        var startLivingAreaMin = filter.size_living_area_min;
        var startLivingAreaMax = filter.size_living_area_max;
        var startLotSizeMin = filter.size_lot_min;
        var startLotSizeMax = filter.size_lot_max;
        
        filter.baths_min = 1;
        filter.baths_max = 2;
        var chartIntervals = [];
        
        for (var i = 0; i < 3; i++) {
            while(startPriceMin != filter.priceMin || startPriceMax != filter.priceMax ||
                  startBedsMin != filter.beds_min || startBedsMax != filter.beds_max ||
                  startPricePerSqftMin != filter.price_per_sqft_min || startPricePerSqftMax != filter.price_per_sqft_max ||
                  startYearBuiltMin != filter.year_built_min || startYearBuiltMax != filter.year_built_max ||
                  startLivingAreaMin != filter.size_living_area_min || startLivingAreaMax != filter.size_living_area_max ||
                  startLotSizeMin != filter.size_lot_min || startLotSizeMax != filter.size_lot_max){}
            
            var response = await Properties.getByFilter(filter, Map.getMapBounds());
            chartIntervals.push(response.data.count);
            filter.baths_min = filter.baths_min + 1;
            filter.baths_max = filter.baths_max + 1;
        }
        
        filter.baths_min = startBathsMin;
        filter.baths_max = startBathsMax;
        //console.log(chartIntervals.length);
        //console.log(chartIntervals);
        //console.log(chartIntervals[3]);
        
        return chartIntervals;
    }
    
    var getYearBuiltChartCounts = async function(filter) {
        var startPriceMin = filter.priceMin;
        var startPriceMax = filter.priceMax;
        var startBedsMin = filter.beds_min;
        var startBedsMax = filter.beds_max;
        var startBathsMin = filter.baths_min;
        var startBathsMax = filter.baths_max;
        var startPricePerSqftMin = filter.price_per_sqft_min;
        var startPricePerSqftMax = filter.price_per_sqft_max;
        var startYearBuiltMin = filter.year_built_min;
        var startYearBuiltMax = filter.year_built_max;
        var startLivingAreaMin = filter.size_living_area_min;
        var startLivingAreaMax = filter.size_living_area_max;
        var startLotSizeMin = filter.size_lot_min;
        var startLotSizeMax = filter.size_lot_max;
        
        filter.year_built_min = currentYear - 10;
        filter.year_built_max = currentYear;
        var chartIntervals = [];
        
        for (var i = 0; i < 5; i++) {
            while(startPriceMin != filter.priceMin || startPriceMax != filter.priceMax ||
                  startBedsMin != filter.beds_min || startBedsMax != filter.beds_max ||
                  startBathsMin != filter.baths_min || startBathsMax != filter.baths_max ||
                  startPricePerSqftMin != filter.price_per_sqft_min || startPricePerSqftMax != filter.price_per_sqft_max || 
                  startLivingAreaMin != filter.size_living_area_min || startLivingAreaMax != filter.size_living_area_max ||
                  startLotSizeMin != filter.size_lot_min || startLotSizeMax != filter.size_lot_max){}
            
            var response = await Properties.getByFilter(filter, Map.getMapBounds());
            chartIntervals.push(response.data.count);
            filter.year_built_min = filter.year_built_min - 10;
            filter.year_built_max = filter.year_built_max - 10;
        }
        
        filter.year_built_min = startYearBuiltMin;
        filter.year_built_max = startYearBuiltMax;
        //console.log(chartIntervals.length);
        //console.log(chartIntervals);
        //console.log(chartIntervals[3]);
        
        return chartIntervals;
    }
    
    var getLivingAreaChartCounts = async function(filter) {
        var startPriceMin = filter.priceMin;
        var startPriceMax = filter.priceMax;
        var startBedsMin = filter.beds_min;
        var startBedsMax = filter.beds_max;
        var startBathsMin = filter.baths_min;
        var startBathsMax = filter.baths_max;
        var startPricePerSqftMin = filter.price_per_sqft_min;
        var startPricePerSqftMax = filter.price_per_sqft_max;
        var startYearBuiltMin = filter.year_built_min;
        var startYearBuiltMax = filter.year_built_max;
        var startLivingAreaMin = filter.size_living_area_min;
        var startLivingAreaMax = filter.size_living_area_max;
        var startLotSizeMin = filter.size_lot_min;
        var startLotSizeMax = filter.size_lot_max;
        
        filter.size_living_area_min = 0;
        filter.size_living_area_max = 5000;
        var chartIntervals = [];
        
        for (var i = 0; i < 4; i++) {
            while(startPriceMin != filter.priceMin || startPriceMax != filter.priceMax ||
                  startBedsMin != filter.beds_min || startBedsMax != filter.beds_max ||
                  startBathsMin != filter.baths_min || startBathsMax != filter.baths_max ||
                  startPricePerSqftMin != filter.price_per_sqft_min || startPricePerSqftMax != filter.price_per_sqft_max || 
                  startYearBuiltMin != filter.year_built_min || startYearBuiltMax != filter.year_built_max ||
                  startLotSizeMin != filter.size_lot_min || startLotSizeMax != filter.size_lot_max){}
            
            var response = await Properties.getByFilter(filter, Map.getMapBounds());
            chartIntervals.push(response.data.count);
            filter.size_living_area_min = filter.size_living_area_min + 5000;
            filter.size_living_area_max = filter.size_living_area_max + 5000;
        }
        
        filter.size_living_area_min = startLivingAreaMin;
        filter.size_living_area_max = startLivingAreaMax;
        //console.log(chartIntervals.length);
        //console.log(chartIntervals);
        //console.log(chartIntervals[3]);
        
        return chartIntervals;
    }
    
    var getLotSizeChartCounts = async function(filter) {
        var startPriceMin = filter.priceMin;
        var startPriceMax = filter.priceMax;
        var startBedsMin = filter.beds_min;
        var startBedsMax = filter.beds_max;
        var startBathsMin = filter.baths_min;
        var startBathsMax = filter.baths_max;
        var startPricePerSqftMin = filter.price_per_sqft_min;
        var startPricePerSqftMax = filter.price_per_sqft_max;
        var startYearBuiltMin = filter.year_built_min;
        var startYearBuiltMax = filter.year_built_max;
        var startLivingAreaMin = filter.size_living_area_min;
        var startLivingAreaMax = filter.size_living_area_max;
        var startLotSizeMin = filter.size_lot_min;
        var startLotSizeMax = filter.size_lot_max;
        
        filter.size_lot_min = 0;
        filter.size_lot_max = 5000;
        var chartIntervals = [];
        
        for (var i = 0; i < 4; i++) {
            while(startPriceMin != filter.priceMin || startPriceMax != filter.priceMax ||
                  startBedsMin != filter.beds_min || startBedsMax != filter.beds_max ||
                  startBathsMin != filter.baths_min || startBathsMax != filter.baths_max ||
                  startPricePerSqftMin != filter.price_per_sqft_min || startPricePerSqftMax != filter.price_per_sqft_max || 
                  startYearBuiltMin != filter.year_built_min || startYearBuiltMax != filter.year_built_max ||
                  startLivingAreaMin != filter.size_living_area_min || startLivingAreaMax != filter.size_living_area_max){}
                  
            var response = await Properties.getByFilter(filter, Map.getMapBounds());
            chartIntervals.push(response.data.count);
            filter.size_lot_min = filter.size_lot_min + 5000;
            filter.size_lot_max = filter.size_lot_max + 5000;
        }
        
        filter.size_lot_min = startLotSizeMin;
        filter.size_lot_max = startLotSizeMin;
        //console.log(chartIntervals.length);
        //console.log(chartIntervals);
        //console.log(chartIntervals[3]);
        
        return chartIntervals;
    }
    
    //!End of functions used to retrieve chart data!//
    
    //!Find the sum of all array values!//
    var countArray = function(array){
        var sum = 0;
        for (var i = 0; i < array.length; i++){
            sum = sum + array[i];
        }
        //console.log(sum);
        return sum;
    }
    
    //!A function used to normalize all values of an array within a certain threshold!//
    //In this case threshold: 30 to 70//
    var valueNormalization = function(array){
        var min = 1000000000;
        var max = 0;
        for(var i = 0; i < array.length; i++){
            if (min > array[i]){
                min = array[i];
            }
            if (max < array[i]){
                max = array[i];
            }
        }
        
        //console.log(array);
        //console.log(max);
        //console.log(min);
        var range = max - min;
        var normalizedArray = [];
        
        for(var i=0; i < array.length; i++){
            normalizedArray.push((0.7 * ((array[i] - min)/range) + 0.3) *100);
        }
        //console.log(normalizedArray);
        return normalizedArray;
    }
    
    
    //!Start of functions to populate charts!//
    var populatePriceChart = function(){
            $scope.priceChartLabels = [];
            for(var i = 0; i < 10; i++){
                $scope.priceChartLabels.push(' ');
            }
        
            $scope.priceChartSeries = ['Series A']; //, 'Series B'];
            
            if($scope.priceChartData != undefined){
                $scope.priceChartData.pop();
            }
            else{
                $scope.priceChartData = [];
            }
            $scope.priceChartData.push($scope.normalizedData);

            $scope.priceChartColors = [{backgroundColor: '#135271', //borderColor 
                                  //'#151B54', //backgroundColor
                                  //'#151B54', 
                                  //'#151B54'
                                  }];

            $scope.priceChartOptions = {scales: {
                                                yAxes: [{
                                                    display: false,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }],
                                                xAxes: [{
                                                    display: false,
                                                    categoryPercentage: 1.0,
                                                    barPercentage: 1.0,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }]
                                        },
                                        layout: {
                                            padding: {
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                bottom: 0
                                            }
                                        },
                                        tooltips: {
                                            enabled: false
                                        }
                                        };
    }
    
    var populateBedsChart = function(){
            $scope.bedsChartLabels = [];
            for(var i = 0; i < 7; i++){
                $scope.bedsChartLabels.push(' ');
            }
        
            $scope.bedsChartSeries = ['Series A']; //, 'Series B'];
            
            if($scope.bedsChartData != undefined){
                $scope.bedsChartData.pop();
            }
            else{
                $scope.bedsChartData = [];
            }
            $scope.bedsChartData.push($scope.normalizedData);

            $scope.bedsChartColors = [{backgroundColor: '#135271', //borderColor 
                                  //'#151B54', //backgroundColor
                                  //'#151B54', 
                                  //'#151B54'
                                  }];

            $scope.bedsChartOptions = {scales: {
                                                yAxes: [{
                                                    display: false,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }],
                                                xAxes: [{
                                                    display: false,
                                                    categoryPercentage: 1.0,
                                                    barPercentage: 1.0,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }]
                                        },
                                        layout: {
                                            padding: {
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                bottom: 0
                                            }
                                        },
                                        tooltips: {
                                            enabled: false
                                        }
                                        };
    }

    var populateBathsChart = function(){
            $scope.bathsChartLabels = [];
            for(var i = 0; i < 3; i++){
                $scope.bathsChartLabels.push(' ');
            }
        
            $scope.bathsChartSeries = ['Series A']; //, 'Series B'];
            
            if($scope.bathsChartData != undefined){
                $scope.bathsChartData.pop();
            }
            else{
                $scope.bathsChartData = [];
            }
            $scope.bathsChartData.push($scope.normalizedData);

            $scope.bathsChartColors = [{backgroundColor: '#135271', //borderColor 
                                  //'#151B54', //backgroundColor
                                  //'#151B54', 
                                  //'#151B54'
                                  }];

            $scope.bathsChartOptions = {scales: {
                                                yAxes: [{
                                                    display: false,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }],
                                                xAxes: [{
                                                    display: false,
                                                    categoryPercentage: 1.0,
                                                    barPercentage: 1.0,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }]
                                        },
                                        layout: {
                                            padding: {
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                bottom: 0
                                            }
                                        },
                                        tooltips: {
                                            enabled: false
                                        }
                                        };
    }
    
    var populateYearBuiltChart = function(){
            $scope.yearBuiltChartLabels = [];
            for(var i = 0; i < 5; i++){
                $scope.yearBuiltChartLabels.push(' ');
            }
        
            $scope.yearBuiltChartSeries = ['Series A']; //, 'Series B'];
            
            if($scope.yearBuiltChartData != undefined){
                $scope.yearBuiltChartData.pop();
            }
            else{
                $scope.yearBuiltChartData = [];
            }
            $scope.yearBuiltChartData.push($scope.normalizedData);

            $scope.yearBuiltChartColors = [{backgroundColor: '#135271', //borderColor 
                                  //'#151B54', //backgroundColor
                                  //'#151B54', 
                                  //'#151B54'
                                  }];

            $scope.yearBuiltChartOptions = {scales: {
                                                yAxes: [{
                                                    display: false,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }],
                                                xAxes: [{
                                                    display: false,
                                                    categoryPercentage: 1.0,
                                                    barPercentage: 1.0,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }]
                                        },
                                        layout: {
                                            padding: {
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                bottom: 0
                                            }
                                        },
                                        tooltips: {
                                            enabled: false
                                        }
                                        };
    }
    
    var populateLivingAreaChart = function(){
            $scope.livingAreaChartLabels = [];
            for(var i = 0; i < 4; i++){
                $scope.livingAreaChartLabels.push(' ');
            }
        
            $scope.livingAreaChartSeries = ['Series A']; //, 'Series B'];
            
            if($scope.livingAreaChartData != undefined){
                $scope.livingAreaChartData.pop();
            }
            else{
                $scope.livingAreaChartData = [];
            }
            $scope.livingAreaChartData.push($scope.normalizedData);

            $scope.livingAreaChartColors = [{backgroundColor: '#135271', }];

            $scope.livingAreaChartOptions = {scales: {
                                                yAxes: [{
                                                    display: false,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }],
                                                xAxes: [{
                                                    display: false,
                                                    categoryPercentage: 1.0,
                                                    barPercentage: 1.0,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }]
                                        },
                                        layout: {
                                            padding: {
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                bottom: 0
                                            }
                                        },
                                        tooltips: {
                                            enabled: false
                                        }
                                        };
    }
    
    var populateLotSizeChart = function(){
            $scope.lotSizeChartLabels = [];
            for(var i = 0; i < 4; i++){
                $scope.lotSizeChartLabels.push(' ');
            }
        
            $scope.lotSizeChartSeries = ['Series A']; //, 'Series B'];
            
            if($scope.lotSizeChartData != undefined){
                $scope.lotSizeChartData.pop();
            }
            else{
                $scope.lotSizeChartData = [];
            }
            $scope.lotSizeChartData.push($scope.normalizedData);

            $scope.lotSizeChartColors = [{backgroundColor: '#135271', }];

            $scope.lotSizeChartOptions = {scales: {
                                                yAxes: [{
                                                    display: false,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }],
                                                xAxes: [{
                                                    display: false,
                                                    categoryPercentage: 1.0,
                                                    barPercentage: 1.0,
                                                    gridLines: {
                                                        display:false
                                                    }
                                                }]
                                        },
                                        layout: {
                                            padding: {
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                bottom: 0
                                            }
                                        },
                                        tooltips: {
                                            enabled: false
                                        }
                                        };
    }

    //!End of functions to populate charts!//
    
    //!Update Apply button text and make it clickable during current execution cycle!//
    var updateApplyButton = function() {
        $scope.$apply(function(){
            $scope.applyButtonText = "Apply Filter " + "(" + $scope.totalCount + ")";
            $scope.applyButtonDisabled = false;
        });
    }
    
    //END of Lester's filter code - #783 - lhern207@fiu.edu

    //!Handle closing filter dropdown!//
 	$scope.closeFilter = function() {
 		//console.log("close filter");
 		$scope.filterHide = true;
 	}
 	//console.log(filter);
 	if(parsedAddress.number != null) {
 		filter.address_internet_display = parsedAddress.number + " " + parsedAddress.street;
 	}
	if(!$.isEmptyObject(parsedAddress)) {
	 	filter.city = parsedAddress.regions[0];
	 	filter.state_or_province = parsedAddress.state;
	 	filter.postal_code = parsedAddress.postalcode;
 	}

 	//var filter = Properties.getSearch();
 	//console.log("Is the filter being used");
 	//console.log(filter);
 	//console.log("Are we checking the result of the filter?");
 	//console.log(getPropertiesByFilter(filter));
    
    //!A call to filter properties when page is loaded!//
 	getPropertiesByFilter(filter);
    processCharts(filter);

	// Save user's search
	$scope.saveCurrentSearch = function() {
		Properties.saveSearch("Saved search", filter);
		Users.getSavedSearches().then(function(res){
	      toasts.show("Search filters saved");
	      //console.log($rootScope.savedSearches);
	    });
	}



	// Infinite scroll: load next page of properties into $scope
	$scope.onCardsHover = function (property, e) {
		// Map.hightLightPropertyInList(property);
	}

	$scope.onCardsHoverOut = function(e) {
		// Map.removeHighlight();
	}



	//local test
//   var properties =[]
//  for(var i = 0; i < 50; i++) {
//  var pro = {id:i}
// 	properties.push(pro)

//  }
//  Map.setProperties(properties)
//  console.log(properties)
// $scope.properties = {results:properties}
// propertiesBusy = false;
	//local test end




	// Properties.getAll().then(function(res){
	// 	$scope.properties = res.data.results.slice(0, 50);
	// 	console.log($scope.properties);
	// 	Map.setProperties($scope.properties)
	// });

	var priceRange = [
		0,
		1000,
		10000,
		100000,
		150000,
		200000,
		250000,
		1000000,
		10000000
	];
    
    //!Used in price slider?!//
	/*$scope.selectPrice = function(num) {
		var min, max;
		$("#rangePrice").html($("#price"+num).html());
		if(num !== 0) {
			min = priceRange[num-1];
			max = priceRange[num];
			filter.priceMin = min;
			filter.priceMax = max;
			// console.log(filter);
		}
		getPropertiesByFilter(filter);
	}*/

	// Properties.printSearch();
	$scope.selectBed = function(num) {
		$("#rangeBed").html($("#bed"+num).html());
	}
	$scope.selectType = function(num) {
		$("#rangeType").html($("#type"+num).html());
	}
	$scope.selectPurp = function(num) {
		$("#rangePurp").html($("#purp"+num).html());
	}

	// Add property to user list
	$scope.addPropertyToList = function(e, prop, id){
		e.preventDefault();
		$scope.propertyToAdd = id;

		// Prompt user to login if they aren't
		if(!$rootScope.user){
			ModalService.showModal({
			  templateUrl: "views/modals/login.html",
			  controller: "ResultsCtrl",
			  scope: $scope
			}).then(function(modal) {
			  modal.element.modal();
			  modal.close.then(function(result) {});
			});
		}

		// If logged in, toggle property save
		else {
			// START #2357 and #2487 Andreina Rojas aroja108@fiu.edu
			if(!prop.saved){
				prop.saved = true;
				
				Properties.save(prop).then(res => {
					console.log(res);

					toasts.show("Added to saved properties");
				})
				
				
				toasts.show("Added to saved properties");
			} else {
				prop.saved = false;

				Properties.unfavorite(id).then(res => {
					toasts.show("Removed property from favorites");
				})
				
				toasts.hide();
			}
			// END #2357 and #2487 Andreina Rojas aroja108@fiu.edu
		}

	}

	$scope.closeModal = function(){
		$('.modal-backdrop').hide();
	}

	// Choose which list to add property to, then add it
	$scope.chooseList = function(list){
		Lists.addPropertyToList($scope.propertyToAdd, list).then(res => {
			$scope.closeModal();
		})
	}

	// Create list
	$scope.createList = function(){
		Lists.create($scope.createListParams).then(res => {
			if(res.status === 201){
				$scope.listCreated = true;
				$scope.lists.unshift(res.data);
			}
		})
	}
	$rootScope.$on( 'map.mapmove', function( event ) {
        if($rootScope.PoLR !=null){
        Map.addPropertiesIntoClusters($scope.properties);
	    Map.clearAllPropertiesLayer()
        Map.addPropertiesIntoClusters($scope.properties);

        }else{
            getPropertiesByFilter(filter);
        }
    });

	$('body').css('overflow', 'hidden');

	// Add commas to price numbers
	$scope.formatPrice = function(x){
		if(x !== null){
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
	}

	// Format city to proper Title Case
	$scope.formatCity = function(x){

		if(x !== null){

			return x.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

		}

	}

	// Open input field to add new property tag

	$scope.openTagModal = function(e){

		e.preventDefault();

		const form = $(e.target.nextElementSibling)[0];

		$(form).addClass('fadeInDown');

	}



	// Close input field to add a new property tag

	$scope.closeTagModal = function(e){

		e.preventDefault();

		const form = $(e.target.offsetParent)[0];

		$(form).removeClass('fadeInDown');

	}



	// Add new tag to property

	$scope.addNewTag = function(e, prop){

		if($scope.settings.tag.newTag){

			$scope.tags.push($scope.settings.tag.newTag);

			$scope.settings.tag.newTag = '';

			const form = $(e.target);

			$(form).removeClass('fadeInDown');

		}

	}


	$scope.tags = ['luxury', 'beautiful', 'modern'];

	$scope.number_beds_options = ["1", "2", "3", "4", "5", "6", "7", "8+"];
    
    $scope.number_baths_options = ["1", "1.5", "2", "2.5", "3", "3.5", "4+"];
    
    $scope.time_options = ["1 day", "1 week", "2 weeks", 
                           "1 month", "3 months", "6 months",
                           "1 year", "2 years", "3 years"];
    

	$scope.things = [
        {text:'1+'},
        {text:'2+'},
        {text:'3+'},
        {text:'4+'},
        {text:'5+'}
        ];
    $scope.thing = 'Home';

    // redirect to property detail
    $scope.clickCard = function(property) {
    	window.location.href = "/#/results/"+property.id;
    }

  //-----------------------------------------------------------------------
  //START sortPropertiesbyAttributes:lcaba026@fiu.edu


  $rootScope.isSorted = false;


  if(!$rootScope.isSorted){
    $rootScope.sortItems = [
      {name:'Price', fullname:"Price", selected: false, asc:false, active:true, checkbox_checked:true},
      {name:'Beds', fullname:"Bedrooms", selected: false, asc:false, active:true, checkbox_checked:true},
      {name:'Baths', fullname:"Bathrooms", selected: false, asc:false, active:true, checkbox_checked:true},
      {name:'Size', fullname:"Square Feet Size", selected: false, asc:false, active:true, checkbox_checked:true},
      {name:'Year', fullname:"Year Built", selected: false, asc:false, active:false, checkbox_checked:false},

    ];

  }


  $scope.sortNameFilter = function (item) {
    return item.selected
  }
  //-----------------------------------------------------------------------
  //Open custom modal to sort properties

	$scope.showSortPropertiesModal = function() {

	ModalService.showModal({
		templateUrl: "views/modals/sortProperties.html",
		controller:"SortPropertiesCtrl",
		bodyClass: "custom-modal-open",
		scope : $scope
	}).then(function(modal) {
	  modal.close.then(function(result) {

	  });

	})
	};
  //--------------------------------------------------------------------------
    //Function that passed an array to sort properties in orderBy in result.html
    var count;

    $scope.orderByAttributes = function(){

      if ($rootScope.sortRule != null){
        $scope.sortRule = Array.from($rootScope.sortRule);
        var arrsort = $scope.sortRule

        count = arrsort.length;
        return arrsort;

      }

    }


  //--------------------------------------------------------------------------
  //Function that returns true if sortItems has more than one element selected

  var counter;
  $scope.isArrEmpty = function(){

    counter = 0;

    for(var i = 0; i < $rootScope.sortItems.length; i++) {
      if (($rootScope.sortItems[i].selected == true) && ($rootScope.isSorted == true)) {
        counter++;
      }
    }
    if (counter > 0){
      return true;
    }
    else{
      return false;
    }
  }
  //--------------------------------------------------------------------------

  $scope.icon_list =
        {
          Price: "glyphicon glyphicon-usd",
          Beds: "fa fa-bed",
          Baths: "fa fa-bath",
          Size: "glyphicon glyphicon-resize-full",
          Year: "glyphicon glyphicon-calendar"
        }

  //--------------------------------------------------------------------------

  $scope.showIconWhenSorted = function() {

    if ((counter == 0) && ($rootScope.isSorted == false)){
      return true;
    }

    else if ((counter !== count) && ($rootScope.isSorted == true) ){
      return false;
    }
    else if ((counter == count)  && ($rootScope.isSorted == true)){
      return false;
    }

  }


  //END sortPropertiesbyAttributes

//START OF Eithel's Hide Property Feature

    //A toggle used to hide each individual property, as it's own dataset -Eithel
    $rootScope.toggleLogin = false;
    $scope.showProperties = false;
    
    $scope.toggleProperty = function(e,property){
        e.preventDefault();
        //console.log(property.visible);
        property.visible = !property.visible;
    };
    //When logged in and user clicks button to Hide Hidden Properties - Eithel
  	$scope.hideHiddenProperty = function() {
      toasts.show("Property has been Hidden!");
  	}
  	//When logged in and user clicks button to Unhide Hidden Properties - Eithel
  	$scope.unhideHiddenProperty = function() {
      toasts.show("Property has been Unhidden!");
  	}
  	//PopUp when user isn't signed in -Eithel
  	$scope.userNotLogin = function(){
    	ModalService.showModal({
      		templateUrl: "views/modals/userNotLoginPopUp.html",
      		controller: "LandingCtrl",
      		scope: $scope
    	}).then(function(modal) {
      		modal.element.modal();
      		modal.close.then(function() {});
    	});
  	}
	//Redirect user if feature is clicked and user doesn't have an account -Eithel
 	$scope.redirectToLanding = function(){
    	$scope.closeModal();
    	$rootScope.toggleLogin = true;
    	window.location.href = "/#/landing/";
  	}

    //Function to hide each property on user's interest -Eithel
	$scope.hideFilter = function (item) {
        if($scope.showProperties) {
	       return true;
        }
        else {
            return item.visible;
        }
    }
    
    //The counter is Dependent on Hiding or Unhiding properties from results found -Eithel
    $scope.propertyCounter = function () {
        var count = 0;
        for(var i in $scope.properties) {
            if($scope.showProperties || $scope.properties[i].visible) {
                count++;
            }
        }
        return count;
    }
    
    //Properties function for hide and unhide purposes in filters pane -Eithel
    $scope.showAll = function(properties) {
        $scope.showProperties = properties;
    }

	//END OF Eithel's Hide Property Feature

	// START #2357 and #2487 Andreina Rojas aroja108@fiu.edu
 	$scope.isSaved = function(prop,id){
 		Properties.isSaved(id).then(function(res){
 			var p = res.data;
 			if(p.length <= 0)
 				return
 			if (p[0].property == id)
 				prop.saved = true;
 			else
 				prop.saved = false;
 		})
	
 	}
 	// END #2357 and #2487 Andreina Rojas aroja108@fiu.edu
    
});
