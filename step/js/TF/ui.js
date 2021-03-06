/**
 * @author afruehstueck
 */

'use strict';

/**
 * convenience function (added to Math) for restricting range of a value
 * @param value			input value to be clamped
 * @param min			minimum output value
 * @param max			maximum output value
 * @returns {number}	clamped value
 */
Math.clamp = function( value, min, max ) { return Math.min( Math.max( min, value ), max ); };

/**
 * interpolate between array elements in arrays a and b
 * t is percentage of a in interpolation
 */
Math.interpolate = function( a, b, t ) {
	if( Array.isArray( a ) && Array.isArray( b ) && a.length === b.length ) {
		return a.map( function( _, i ) { return a[ i ] * ( 1 - t ) + b[ i ] * t; } );
	} else {
		return a * ( 1 - t ) + b * t;
	}
};

var Statistics = function() {};

/**
 * calculates the statistics for an array of data values necessary for displaying the histogram
 *
 * options.*:
 * numBins:		number
 */
Statistics.calcHistogram = function( data, options ) {
	if( options === undefined ) options = {};
	var histogram = {};

	histogram.numBins = options.numBins || 256;

	//calculate range of data values
	var min = Infinity;
	var max = -Infinity;

	var index = data.length;
	while ( index-- ) {
		var value = data[ index ];
		if ( value < min ) {
			min = value;
		}
		if ( value > max ) {
			max = value;
		}
	}

	histogram.range = { min: min, max: max };

	var bins = new Int32Array( histogram.numBins );
	var binScale = histogram.numBins / ( histogram.range.max - histogram.range.min );

	for( var index = 0; index < data.length; index++ ) {
		var value = data[ index ];
		var bin = Math.floor( ( value - histogram.range.min ) * binScale );
		bins[ bin ] += 1;
	}
	histogram.bins = bins;

	histogram.maxBin = 0;
	histogram.maxBinValue = 0;
	for ( var bin = 0; bin < histogram.numBins; bin++ ) {
		if (histogram.bins[ bin ] > histogram.maxBinValue ) {
			histogram.maxBin = bin;
			histogram.maxBinValue = histogram.bins[ bin ];
		}
	}

	return( histogram );
};

/**
 * class containing UI-related functionality
 */
var TF_UI = function() {};

TF_UI.getRelativePosition = function( x, y, elem ) {
	//console.log( 'left: ' + elem.getBoundingClientRect().left + ', top: ' + elem.getBoundingClientRect().top);// + ', width: '  + elem.width + ', height: ' + elem.height );
	return {
		x: x ? x - Math.floor( elem.getBoundingClientRect().left ) : null,
		y: y ? y - Math.floor( elem.getBoundingClientRect().top ) : null
	};
};

/**
 * checks whether object is a DOM element
 * @param obj object passed that will be checked
 * @returns boolean value specifying whether obj is a DOM element or not
 */
TF_UI.isDOMElement = function( obj ) {
	return (
		typeof HTMLElement === "object" ? obj instanceof HTMLElement : /*DOM2*/ obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string"
	);
};

/* display spinning loading icon */
TF_UI.loading = function( container ) {
	container = container || document.body;

	var loading = document.getElementById( 'loading' );
	if( !loading ) {
		loading = document.createElement( 'div' );
		loading.id = 'loading';

		var spinner = document.createElement( 'div' );
		loading.appendChild( spinner );
	}

	container.appendChild( loading );
	loading.style.visibility = 'visible';
};

/* hide spinning loading icon */
TF_UI.finishedLoading = function() {
	var loading = document.getElementById( 'loading' );
	if( loading ) {
		loading.style.visibility = 'hidden';
	}
};

/**
 * UI element - eventually replace with Steve's UI class
 */
var Panel = function( options ) {
	if( options === undefined ) options = {};
	var dom = document.createElement( 'div' );
	dom.className = 'panel';
	var container = options.container || document.body;
	container.appendChild( dom );
	this.dom = dom;
	this.top = 0;
	this.left = 0;
};

Panel.prototype.toggle = function() {
	this.dom.style.visibility = ( this.dom.style.visibility === 'hidden' ) ? 'visible' : 'hidden';
};

Panel.prototype.hide = function() {
	this.dom.style.visibility = 'hidden';
};

Panel.prototype.show = function() {
	this.dom.style.visibility = 'visible';
};

Panel.prototype.moveTo = function( x, y ) {
	this.dom.style.top = y + 'px';
	this.top = y;
	this.dom.style.left = x + 'px';
	this.left = x;
};

/**
 * account for class functions
 * from https://toddmotto.com/hacking-svg-traversing-with-ease-addclass-removeclass-toggleclass-functions/
 */
Panel.prototype.hasClass = function ( className ) {
	return new RegExp( '(\\s|^)' + className + '(\\s|$)' ).test( this.dom.getAttribute( 'class' ) );
};

Panel.prototype.addClass = function ( className ) {
	if ( !this.hasClass( className ) ) {
		this.dom.setAttribute( 'class', this.dom.getAttribute( 'class' ) + ' ' + className );
	}
};

Panel.prototype.removeClass = function ( className ) {
	var removedClass = this.dom.getAttribute( 'class' ).replace( new RegExp( '(\\s|^)' + className + '(\\s|$)', 'g' ), '$2' );
	if ( this.hasClass( className ) ) {
		this.dom.setAttribute( 'class', removedClass );
	}
};

/**
 * helper class for creating SVG elements
 */
var SVG = function() {};
/**
 * set x- and y position for SVG elements
 * also writes x- and y position to element.data.*
 */
SVG.set = function( x, y ) {
	if( x ) {
		this.setAttribute( ( this.tagName === 'circle' ) ? 'cx' : 'x', x );
		this.data.x = x;
	}
	if( y ) {
		this.setAttribute( ( this.tagName === 'circle' ) ? 'cy' : 'y', y );
		this.data.y = y;
	}
};

/**
 * sets fill color of SVG element
 */
SVG.setFillColor = function( color ) {
	this.setAttribute( 'fill', color );
};

/**
 * sets line color of SVG element
 */
SVG.setLineColor = function( color ) {
	this.setAttribute( 'stroke', color );
};

/**
 * create an SVG circle
 * @param parent		DOM element the SVG will be appended to
 * @param cx			x-coordinate of circle
 * @param cy			y-coordinate of circle
 * @param fillColor		fill color of circle
 * @param r				radius of circle
 * @param strokeColor	stroke color of circle
 * @param strokeWidth	width of stroke of circle
 * @returns {Element}	returns created circle SVG element, appended to parent
 */
SVG.createCircle = function( parent, cx, cy, fillColor, r, strokeColor, strokeWidth ) {
	if( fillColor === undefined ) fillColor = 'none';
	if( r === undefined ) r = 7;
	if( strokeColor === undefined ) strokeColor = '#aaa';
	if( strokeWidth === undefined ) strokeWidth = 2;

	var circle = document.createElementNS( SVG.svgNS, 'circle' );

	circle.setAttribute( 'class', 'circle' );
	circle.setAttribute( 'cx', cx );
	circle.setAttribute( 'cy', cy );
	circle.setAttribute( 'r', r );
	circle.setAttribute( 'fill', fillColor );
	circle.setAttribute( 'stroke', strokeColor );
	circle.setAttribute( 'stroke-width', strokeWidth );

	//write x, y and r to a data object in order to make these parameters easily accessible from outside
	circle.data = {};
	circle.data.x = cx;
	circle.data.y = cy;
	circle.data.r = r;

	circle.set = this.set;
	circle.setFillColor = this.setFillColor;
	circle.setLineColor = this.setLineColor;

	if( parent ) {
		circle.parent = parent;
		circle.parent.appendChild( circle );
	}
	return circle;
};

/**
 * create an SVG rectangle
 * @param parent		DOM element the SVG will be appended to
 * @param x				x-coordinate of rectangle
 * @param y				y-coordinate of rectangle
 * @param fillColor		fill color of rectangle
 * @param w				width of rectangle
 * @param h				height of rectangle
 * @param strokeColor	stroke color of rectangle
 * @param strokeWidth	stroke width of rectangle
 * @returns {Element}	returns created rectangle SVG element, appended to parent
 */
SVG.createRect = function( parent, x, y, fillColor, w, h, strokeColor, strokeWidth ) {
	if( fillColor === undefined ) fillColor = 'black';
	if( w === undefined ) w = 12;
	if( h === undefined ) h = 12;
	if( strokeColor === undefined ) strokeColor = '#aaa';
	if( strokeWidth === undefined ) strokeWidth = 2;

	var rect = document.createElementNS( SVG.svgNS, 'rect' );
	rect.setAttribute( 'class', 'rect' );
	rect.setAttribute( 'x', x );
	rect.setAttribute( 'y', y );
	rect.setAttribute( 'width', w );
	rect.setAttribute( 'height', h );
	rect.setAttribute( 'fill', fillColor );
	rect.setAttribute( 'stroke', strokeColor );
	rect.setAttribute( 'stroke-width', strokeWidth );

	rect.data = {};
	rect.data.x = x;
	rect.data.y = y;
	rect.data.width = w;
	rect.data.height = h;

	rect.set = this.set;
	rect.setFillColor = this.setFillColor;
	rect.setLineColor = this.setLineColor;

	if( parent ) {
		rect.parent = parent;
		rect.parent.appendChild( rect );
	}
	return rect;
};

/**
 *  create an SVG Polyline
 *
 * accepts an array of point objects where attrX and and attrY denotes the key to the x and y components within the point object
 * (e.g. points = [ { value: 0.6, alpha: 0.2 }, { value: 0.9, alpha: 0.5 } ] where attrX = 'value' and attrY = 'alpha' OR
 * (e.g. points = [ { x: 0.6, y: 0.2 }, { x: 0.9, y: 0.5 } ] where attrX = 'x' and attrY = 'y'
 * width and height allow the point values to be scaled to the range of the parent element
 *
 * @param parent		DOM element the SVG will be appended to
 * @param points		array of objects containing point information
 * @param scaleWidth	optional scale factor by which the x-location will be multiplied
 * @param scaleHeight	optional scale factor by which the y-location will be multiplied
 * @param attrX			name of x-Attribute in point object array
 * @param attrY			name of y-Attribute in point object array
 * @param invertY		invert Y values for normalized y-values (use 1 - y instead of y)
 * @param fillColor		fill color of polyline (fills convex areas in polyline
 * @param strokeColor	stroke color of polyline
 * @param strokeWidth	stroke width of polyline
 * @returns {Element}	returns created polyline SVG element, appended to parent
 */
SVG.createPolyline = function( parent, points, scaleWidth, scaleHeight, attrX, attrY, invertY, strokeColor, strokeWidth, fillColor ) {
	if( scaleWidth === undefined ) scaleWidth = 1;
	if( scaleHeight === undefined ) scaleHeight = 1;
	if( attrX === undefined ) attrX = 'x';
	if( attrY === undefined ) attrX = 'y';
	if( invertY === undefined ) invertY = true;
	if( strokeColor === undefined ) strokeColor = '#eee';
	if( strokeWidth === undefined ) strokeWidth = 3;
	if( fillColor === undefined ) fillColor = 'none';

	var polyline = document.createElementNS( SVG.svgNS, 'polyline' );
	polyline.setAttribute( 'class', 'line' );
	if( points ) {
		polyline.setAttribute( 'points', pointsToString( points, scaleWidth, scaleHeight ) );
	}
	polyline.setAttribute( 'fill', fillColor );
	polyline.setAttribute( 'stroke', strokeColor );
	polyline.setAttribute( 'stroke-width', strokeWidth );

	polyline.data = {};
	polyline.data.points = points;

	function pointsToString( points ) {
		var pointString = '';

		for( var index = 0; index < points.length; index++ ) {
			var point = points[ index ];
			pointString += point[ attrX ] * scaleWidth + ',' + ( invertY ? ( 1 - point[ attrY ] ) : point[ attrY ] ) * scaleHeight + ' ';
		}
		return pointString;
	}

	function setPoints( points ) {
		this.setAttribute( 'points', pointsToString( points ) );
		this.data.points = points;
	}

	function resize( width, height ) {
		scaleWidth = width;
		scaleHeight = height;
	}

	polyline.resize = resize;
	polyline.setPoints = setPoints;
	polyline.setFillColor = this.setFillColor;
	polyline.setLineColor = this.setLineColor;

	if( parent ) {
		polyline.parent = parent;
		polyline.parent.appendChild( polyline );
	}
	return polyline;
};

SVG.createLine = function( parent, points, scaleWidth, scaleHeight, invertY, strokeColor, strokeWidth ) {
	if( scaleWidth === undefined ) scaleWidth = 1;
	if( scaleHeight === undefined ) scaleHeight = 1;
	if( invertY === undefined ) invertY = true;
	if( strokeColor === undefined ) strokeColor = '#eee';
	if( strokeWidth === undefined ) strokeWidth = 3;

	var line = document.createElementNS( SVG.svgNS, 'line' );
	line.setAttribute( 'class', 'line' );
	if( points ) {
		line.setPoints( points );
	}
	line.setAttribute( 'stroke', strokeColor );
	line.setAttribute( 'stroke-width', strokeWidth );

	line.data = {};
	line.data.points = [];

	function setPoints( points ) {
		this.setAttribute( 'x1', String( points[ 0 ].x * scaleWidth ) );
		this.setAttribute( 'y1', String( ( invertY ? ( 1 - points[ 0 ].y ) : points[ 0 ].y ) * scaleHeight ) );
		this.setAttribute( 'x2', String( points[ 1 ].x * scaleWidth ) );
		this.setAttribute( 'y2', String( ( invertY ? ( 1 - points[ 1 ].y ) : points[ 1 ].y ) * scaleHeight ) );
		this.data.points = points;
	}


	function resize( width, height ) {
		scaleWidth = width;
		scaleHeight = height;
	}

	line.resize = resize;
	line.setPoints = setPoints;
	line.setFillColor = this.setFillColor;
	line.setLineColor = this.setLineColor;

	line.parent = parent;
	line.parent.appendChild( line );
	return line;
};

SVG.createVLine = function( parent, point, scaleWidth, scaleHeight, invertY, strokeColor, strokeWidth ) {
	if( scaleWidth === undefined ) scaleWidth = 1;
	if( scaleHeight === undefined ) scaleHeight = 1;
	if( invertY === undefined ) invertY = true;
	if( strokeColor === undefined ) strokeColor = '#eee';
	if( strokeWidth === undefined ) strokeWidth = 3;

	var line = SVG.createLine( parent, null, scaleWidth, scaleHeight, invertY, strokeColor, strokeWidth );

	function setPoint( point ) {
		this.setPoints( [ { x: point.x, y: 0 }, { x: point.x, y: point.y } ] );
	}

	line.setPoint = setPoint;

	if( point ) {
		line.setPoint( point );
	}

	return line;
};

SVG.svgNS = 'http://www.w3.org/2000/svg';

/**
 * account for missing SVG class functions
 * from https://toddmotto.com/hacking-svg-traversing-with-ease-addclass-removeclass-toggleclass-functions/
 */
SVGElement.prototype.hasClass = function ( className ) {
	return new RegExp( '(\\s|^)' + className + '(\\s|$)' ).test( this.getAttribute( 'class' ) );
};

SVGElement.prototype.addClass = function ( className ) {
	if ( !this.hasClass( className ) ) {
		this.setAttribute( 'class', this.getAttribute( 'class' ) + ' ' + className );
	}
};

SVGElement.prototype.removeClass = function ( className ) {
	var removedClass = this.getAttribute( 'class' ).replace( new RegExp( '(\\s|^)' + className + '(\\s|$)', 'g' ), '$2' );
	if ( this.hasClass( className ) ) {
		this.setAttribute( 'class', removedClass );
	}
};
