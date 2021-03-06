/*! Catalog v3.6.0 https://www.catalog.style/ */
import PropTypes from 'prop-types';
import createEmotion from 'create-emotion';
import React, { Component, Children, PureComponent, createElement, isValidElement } from 'react';
import { filter, compose, split, complement, isEmpty, mergeAll, is, toLower, head, or } from 'ramda';
import { safeLoad, CORE_SCHEMA, Type, Schema } from 'js-yaml';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markdown';
import { hcl } from 'd3-color';
import ReactDOM, { unstable_renderSubtreeIntoContainer, unmountComponentAtNode } from 'react-dom';
import raf from 'raf';
import marked from 'marked';
import { Link, Route, Router, applyRouterMiddleware, browserHistory, hashHistory } from 'react-router';
import Slugger from 'github-slugger';
import { parse, stringify } from 'srcset';
import { transform } from 'babel-standalone';
import { parse as parse$1 } from 'url';
import DocumentTitle from 'react-document-title';
import 'raf/polyfill';
import { useScroll } from 'react-router-scroll';

var seqKey = (function (namespace) {
  var counter = void 0;
  counter = 0;
  return function () {
    return namespace + "-" + counter++;
  };
});

var warning = function warning() {};

if (process.env.NODE_ENV !== "production") {
  // Logs an error if condition is _not_ met.
  warning = function warning(condition, message) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    if (condition) {
      return;
    }

    if (typeof console !== "undefined") {
      var _console;

      (_console = console).error.apply(_console, ["Catalog warning: " + message].concat(args)); // eslint-disable-line no-console
    }
  };
}

var warning$1 = warning;

var removeMultiSlashes = function removeMultiSlashes(path) {
  return path.replace(/\/+/g, "/");
};
var stripTrailingSlashes = function stripTrailingSlashes(path) {
  return path.replace(/\/+$/, "");
};
var addLeadingSlash = function addLeadingSlash(path) {
  return path.charAt(0) === "/" ? path : "/" + path;
};
var stripBasePath = function stripBasePath(path, basePath) {
  return basePath !== "/" && path.indexOf(basePath) === 0 ? path.substr(basePath.length) : path;
};
var absoluteUrlRe = /^[a-z][a-z0-9+.-]*:/;

var parsePath = function parsePath(path, options) {
  var pathname = path;
  var hash = "";
  var anchor = null;

  if (!absoluteUrlRe.test(pathname)) {
    var hashIndex = pathname.indexOf("#");
    if (hashIndex !== -1) {
      hash = pathname.substr(hashIndex);
      anchor = pathname.substr(hashIndex + 1);
      pathname = pathname.substr(0, hashIndex);
    }

    if (pathname === "" && options.page) {
      // fall back to current page path (already contains basePath)
      pathname = stripBasePath(options.page.path, options.basePath);
    }

    // join basePath
    pathname = addLeadingSlash(stripTrailingSlashes(removeMultiSlashes(options.basePath + "/" + stripBasePath(pathname, options.basePath))));
  }

  return options.useBrowserHistory ? { pathname: pathname, hash: hash === "#" ? "" : hash } : { pathname: pathname, query: anchor ? { a: anchor } : {} };
};

var getPublicPath = function getPublicPath(path, options) {
  return absoluteUrlRe.test(path) ? path : options.publicUrl + addLeadingSlash(stripBasePath(path, options.basePath));
};

var isInternalPath = function isInternalPath(parsedPath, options) {
  return options.pagePaths.has(parsedPath.pathname);
};

/* eslint-disable key-spacing */

var DefaultTheme = {
  // Colors
  background: "#F9F9F9",
  textColor: "#333333",
  codeColor: "#00263E",
  linkColor: "#FF5555",

  // NavigationBar background color, but also sometimes used as a foreground
  // or border color.
  lightColor: "#D6D6D6",

  // Used in PageHeader
  pageHeadingBackground: "#003B5C",
  pageHeadingTextColor: "#fff",

  // Used in Menu and PageHeader to make sure the top parts have
  // the same height.
  pageHeadingHeight: 200,

  // Used for navigation bar
  navBarBackground: "#F2F2F2",
  navBarTextColor: "#003B5C",

  // Used in ResponsiveTabs (tab text), Download specimen (title text).
  // Typography: headings.
  brandColor: "#003B5C",

  sidebarColor: "#FFFFFF",
  sidebarColorText: "#003B5C",
  sidebarColorTextActive: "#FF5555",
  sidebarColorLine: "#EBEBEB",
  sidebarColorHeading: "#003B5C",

  // Used in the html, react, and image specimens.
  bgLight: "#F2F2F2",
  bgDark: "#333333",

  // Keys appear to be PrismJS token types.
  codeStyles: {
    tag: { color: "#FF5555" },
    punctuation: { color: "#535353" },
    script: { color: "#3F7397" },
    function: { color: "#FF5555" },
    keyword: { color: "#3F7397" },
    string: { color: "#00263E" }
  },

  // Patterns
  checkerboardPatternLight: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAAAAACoWZBhAAAAF0lEQVQI12P4BAI/QICBFCaYBPNJYQIAkUZftTbC4sIAAAAASUVORK5CYII=",
  checkerboardPatternDark: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAAAAACoWZBhAAAAFklEQVQI12NQBQF2EGAghQkmwXxSmADZJQiZ2ZZ46gAAAABJRU5ErkJggg==",

  // Fonts
  fontFamily: "'Roboto', sans-serif",
  fontHeading: "'Roboto', sans-serif",
  fontMono: "'Roboto Mono', monospace",

  // Base font size in pixels.
  baseFontSize: 16,

  // Modular scale ratio that is used to figure out all the different font sizes
  msRatio: 1.2
};

var DefaultResponsiveSizes = [{ name: "small", width: 360, height: 640 }, { name: "medium", width: 1024, height: 768 }, { name: "large", width: 1440, height: 900 }, { name: "xlarge", width: 1920, height: 1080 }];

var pageShape = PropTypes.shape({
  title: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  index: PropTypes.number,
  path: PropTypes.string,
  src: PropTypes.string,
  pages: PropTypes.array, // should be arrayOf(page) but that doesn't work
  styles: PropTypes.array.isRequired,
  scripts: PropTypes.array.isRequired,
  imports: PropTypes.object.isRequired,
  hideFromMenu: PropTypes.boolean
});

var pagesShape = PropTypes.arrayOf(pageShape);

var catalogShape = PropTypes.shape({
  basePath: PropTypes.string.isRequired,
  publicUrl: PropTypes.string.isRequired,
  page: pageShape.isRequired,
  getSpecimen: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  responsiveSizes: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  pages: pagesShape.isRequired,
  pageTree: pagesShape.isRequired,
  pagePaths: PropTypes.instanceOf(Set).isRequired,
  logoSrc: PropTypes.string
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

// Base styles

var baseTextStyle = {
  fontStyle: "normal",
  fontWeight: 400,
  textRendering: "optimizeLegibility",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  letterSpacing: "normal"
};

// Helpers

// Modular scale font size helper; level can be negative (for smaller font sizes) and positive (for larger font sizes) integers; level 0 === baseFontSize
var getFontSize = function getFontSize(_ref) {
  var baseFontSize = _ref.baseFontSize,
      msRatio = _ref.msRatio;
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return baseFontSize / 16 * Math.pow(msRatio, level) + "rem";
};

// Exports

// Text font style
var text = function text(theme) {
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return _extends({}, baseTextStyle, {
    color: theme.textColor,
    fontFamily: theme.fontFamily,
    fontSize: getFontSize(theme, level),
    lineHeight: theme.msRatio * theme.msRatio
  });
};

// Heading font style
var heading = function heading(theme) {
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return _extends({}, baseTextStyle, {
    color: theme.brandColor,
    fontFamily: theme.fontHeading,
    fontSize: getFontSize(theme, level),
    lineHeight: theme.msRatio,
    position: "relative"
  });
};

var context = typeof global !== "undefined" ? global : {};

if (context.__CATALOG_EMOTION_INSTANCE__ === undefined) {
  context.__CATALOG_EMOTION_INSTANCE__ = {};
}

var _createEmotion = createEmotion(context.__CATALOG_EMOTION_INSTANCE__, {
  // The key option is required when there will be multiple instances in a single app
  key: "catalog"
}),
    flush = _createEmotion.flush,
    hydrate = _createEmotion.hydrate,
    cx = _createEmotion.cx,
    merge = _createEmotion.merge,
    getRegisteredStyles = _createEmotion.getRegisteredStyles,
    injectGlobal = _createEmotion.injectGlobal,
    keyframes = _createEmotion.keyframes,
    css = _createEmotion.css,
    sheet = _createEmotion.sheet,
    caches = _createEmotion.caches;

var Span = function Span(_ref) {
  var _ref$span = _ref.span,
      span = _ref$span === undefined ? 6 : _ref$span,
      children = _ref.children;

  var style = {
    boxSizing: "border-box",
    display: "flex",
    flexBasis: "100%",
    // Bug fix for Firefox; width and flexBasis don't work on horizontally scrolling code blocks
    maxWidth: "100%",
    flexWrap: "wrap",
    margin: "24px 0 0 0",
    padding: 0,
    position: "relative",
    "@media (min-width: 640px)": {
      flexBasis: "calc(" + span / 6 * 100 + "% - 10px)",
      // Bug fix for Firefox; width and flexBasis don't work on horizontally scrolling code blocks
      maxWidth: "calc(" + span / 6 * 100 + "% - 10px)",
      margin: "24px 10px 0 0"
    }
  };
  return React.createElement(
    "div",
    { className: /*#__PURE__*/ /*#__PURE__*/css(style, "label:Span;", "label:Span;") },
    children
  );
};

var mapSpecimenOption = function mapSpecimenOption(test, map) {
  return function (option) {
    var match = test.exec(option);
    if (match) {
      var value = match[1];

      return map(value);
    }
    return null;
  };
};

var removeEmpty = filter(complement(isEmpty));
var splitType = compose(removeEmpty, split("|"));
var splitOptions = compose(removeEmpty, split(","));

var camelize = function camelize(str) {
  return str.replace(/-(\w)/g, function (_, c) {
    return c.toUpperCase();
  });
};

var nothing = function nothing() {
  return null;
};
var mapSpanToProp = mapSpecimenOption(/^span-(\d)$/, function (v) {
  return { span: +v };
});
var camelizeOption = function camelizeOption(option) {
  var _ref;

  return _ref = {}, _ref[camelize(option)] = true, _ref;
};

var optionToKeyValue = function optionToKeyValue(mapOptionsToProps) {
  return function (option) {
    var _arr = [mapOptionsToProps, mapSpanToProp];

    for (var _i = 0; _i < _arr.length; _i++) {
      var mapper = _arr[_i];
      if (typeof mapper === "function") {
        var prop = mapper(option);
        if (prop !== null) {
          return prop;
        }
      }
    }
    return camelizeOption(option);
  };
};

var parseSpecimenOptions = function parseSpecimenOptions() {
  var mapOptionsToProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : nothing;
  return function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

    var _splitType = splitType(options),
        _splitType$ = _splitType[1],
        restOptions = _splitType$ === undefined ? "" : _splitType$;

    return mergeAll(splitOptions(restOptions).map(optionToKeyValue(mapOptionsToProps)));
  };
};

var defaultMapBodyToProps = function defaultMapBodyToProps(parsedBody, rawBody) {
  return parsedBody || rawBody;
};

var INITIAL_SEPARATOR = /[ \t]*---[ \t]*\n/;
var SEPARATOR = /\n[ \t]*---[ \t]*\n/;
var splitText = function splitText(text) {
  var matched = text.match(INITIAL_SEPARATOR);
  if (matched && matched.index === 0) {
    return [void 0, text.slice(matched[0].length)];
  }
  matched = text.match(SEPARATOR);
  return matched && matched.index > -1 ? [text.slice(0, matched.index), text.slice(matched.index + matched[0].length)] : [void 0, text];
};

var parseYaml = function parseYaml(str, imports) {
  var parsed = void 0;
  try {
    var ImportType = new Type("!import", {
      kind: "scalar",
      // TODO: Gracefully handle missing imports
      // resolve(key) {
      //   return imports.hasOwnProperty(key);
      // },
      construct: function construct(key) {
        return imports[key];
      }
    });

    var yamlOptions = {
      schema: Schema.create(CORE_SCHEMA, [ImportType])
    };

    parsed = safeLoad(str, yamlOptions);
  } catch (e) {
    parsed = void 0;
  }
  return typeof parsed === "string" ? void 0 : parsed;
};

var parseSpecimenYamlBody = function parseSpecimenYamlBody(_mapBodyToProps) {
  return function () {
    var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var imports = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var mapBodyToProps = _mapBodyToProps || defaultMapBodyToProps;
    return mapBodyToProps(parseYaml(body, imports), body);
  };
};

var parseSpecimenBody = function parseSpecimenBody(_mapBodyToProps) {
  return function () {
    var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var imports = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var mapBodyToProps = _mapBodyToProps || defaultMapBodyToProps;
    var splitBody = splitText(body);
    var props = splitBody[0],
        children = splitBody[1];

    return mapBodyToProps(_extends({}, parseYaml(props, imports), { children: children }), body);
  };
};

function Specimen(mapBodyToProps, mapOptionsToProps) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var parseOptions = parseSpecimenOptions(mapOptionsToProps);
  var parseBody = options.withChildren ? parseSpecimenBody(mapBodyToProps) : parseSpecimenYamlBody(mapBodyToProps);

  return function (WrappedSpecimen) {
    var SpecimenContainer = function SpecimenContainer(props, _ref) {
      var catalog = _ref.catalog;
      var rawOptions = props.rawOptions,
          rawBody = props.rawBody;

      var optionProps = parseOptions(rawOptions);
      var bodyProps = parseBody(rawBody, catalog.page.imports);
      var span = props.span || bodyProps.span || optionProps.span;

      return React.createElement(
        Span,
        { span: span },
        React.createElement(WrappedSpecimen, _extends({}, optionProps, bodyProps, props, {
          catalog: catalog
        }))
      );
    };

    SpecimenContainer.propTypes = {
      span: PropTypes.number,
      rawBody: PropTypes.string,
      rawOptions: PropTypes.string
    };

    SpecimenContainer.contextTypes = {
      catalog: catalogShape.isRequired
    };

    return SpecimenContainer;
  };
}

var getStyle = function getStyle(theme) {
  return {
    pre: _extends({}, text(theme, -0.5), {
      background: "#fff",
      border: "none",
      boxSizing: "border-box",
      color: theme.codeColor,
      display: "block",
      height: "auto",
      margin: 0,
      overflow: "auto",
      WebkitOverflowScrolling: "touch",
      padding: 20,
      whiteSpace: "pre",
      width: "100%"
    }),
    code: {
      fontFamily: theme.fontMono,
      fontWeight: 400
    }
  };
};

var isToken = function isToken(t) {
  return t instanceof Prism.Token;
};

var renderPrismTokens = function renderPrismTokens(tokens, styles) {
  return tokens.map(function (t, i) {
    if (isToken(t)) {
      return React.createElement(
        "span",
        { key: t.type + "-" + i, className: /*#__PURE__*/ /*#__PURE__*/css(styles[t.type], "label:renderPrismTokens;", "label:renderPrismTokens;") },
        Array.isArray(t.content) ? renderPrismTokens(t.content, styles) : t.content
      );
    }

    if (typeof t === "string") {
      return t;
    }

    throw Error("wat");
  });
};

var HighlightedCode = function (_Component) {
  inherits(HighlightedCode, _Component);

  function HighlightedCode() {
    classCallCheck(this, HighlightedCode);
    return possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  HighlightedCode.prototype.render = function render() {
    var _props = this.props,
        language = _props.language,
        theme = _props.theme,
        code = _props.code;

    var styles = getStyle(theme);
    var lang = Prism.languages.hasOwnProperty(language) ? language : null;

    return React.createElement(
      "pre",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.pre, "label:HighlightedCode;", "label:HighlightedCode;") },
      React.createElement(
        "code",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.code, "label:HighlightedCode;", "label:HighlightedCode;") },
        lang ? renderPrismTokens(Prism.tokenize(code, Prism.languages[lang], lang), theme.codeStyles) : code
      )
    );
  };

  return HighlightedCode;
}(Component);


HighlightedCode.propTypes = {
  language: PropTypes.string,
  theme: PropTypes.object.isRequired,
  code: PropTypes.string.isRequired
};

function getStyle$1(theme) {
  return {
    container: _extends({}, text(theme, -0.5), {
      boxSizing: "border-box",
      display: "block",
      width: "100%",
      background: "#fff",
      border: "1px solid #eee",
      color: theme.textColor,
      fontFamily: theme.fontMono,
      fontWeight: 400
    }),
    toggle: {
      textDecoration: "underline",
      cursor: "pointer",
      marginBottom: 0,
      padding: 20,
      WebkitUserSelect: "none",
      userSelect: "none",
      background: "#eee"
    }
  };
}

var Code = function (_React$Component) {
  inherits(Code, _React$Component);

  function Code(props) {
    classCallCheck(this, Code);

    var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.state = {
      viewSource: props.collapsed ? false : true
    };
    return _this;
  }

  Code.prototype.render = function render() {
    var _this2 = this;

    var _props = this.props,
        theme = _props.catalog.theme,
        children = _props.children,
        rawBody = _props.rawBody,
        collapsed = _props.collapsed,
        lang = _props.lang,
        raw = _props.raw;
    var viewSource = this.state.viewSource;

    var styles = getStyle$1(theme);

    var toggle = collapsed ? React.createElement(
      "div",
      {
        className: /*#__PURE__*/ /*#__PURE__*/css(styles.toggle, "label:toggle;", "label:toggle;"),
        onClick: function onClick() {
          return _this2.setState({ viewSource: !viewSource });
        }
      },
      viewSource ? "close" : "show example code"
    ) : null;

    var content = viewSource ? React.createElement(HighlightedCode, {
      language: lang,
      code: raw ? rawBody : children,
      theme: theme
    }) : null;

    return React.createElement(
      "section",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.container, "label:Code;", "label:Code;") },
      toggle,
      content
    );
  };

  return Code;
}(React.Component);

Code.propTypes = {
  children: PropTypes.string.isRequired,
  rawBody: PropTypes.string.isRequired,
  catalog: catalogShape.isRequired,
  collapsed: PropTypes.bool,
  lang: PropTypes.string,
  raw: PropTypes.bool
};

var mapOptionsToProps = mapSpecimenOption(/^lang-(\w+)$/, function (lang) {
  return { lang: lang };
});

var mapBodyToProps = function mapBodyToProps(parsed, rawBody) {
  return _extends({}, parsed, { rawBody: rawBody });
};

var Code$1 = Specimen(mapBodyToProps, mapOptionsToProps, {
  withChildren: true
})(Code);

var RawCode = function RawCode(props) {
  return React.createElement(Code$1, _extends({}, props, { raw: true }));
};

var Audio = function (_React$Component) {
  inherits(Audio, _React$Component);

  function Audio() {
    classCallCheck(this, Audio);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Audio.prototype.render = function render() {
    var _props = this.props,
        src = _props.src,
        title = _props.title,
        loop = _props.loop,
        autoplay = _props.autoplay,
        catalog = _props.catalog,
        theme = _props.catalog.theme;

    var parsedSrc = getPublicPath(src, catalog);

    var styles = {
      section: {
        display: "flex",
        flexFlow: "row wrap",
        minWidth: "calc(100% + 10px)"
      },
      title: _extends({}, heading(theme, 1), {
        margin: 0
      }),
      container: {
        width: "100%",
        background: theme.background
      }
    };

    var audioTitle = title !== undefined ? title : parsedSrc.split("/").slice(-1)[0];

    return React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.container, "label:Audio;", "label:Audio;") },
      React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.title, "label:Audio;", "label:Audio;") },
        audioTitle
      ),
      React.createElement("audio", {
        className: /*#__PURE__*/ /*#__PURE__*/css({ width: "100%" }, "label:Audio;", "label:Audio;"),
        src: parsedSrc,
        autoPlay: autoplay,
        loop: loop,
        controls: true
      })
    );
  };

  return Audio;
}(React.Component);

Audio.propTypes = {
  catalog: catalogShape.isRequired,
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  loop: PropTypes.bool,
  autoplay: PropTypes.bool
};

Audio.defaultProps = {
  loop: false,
  autoplay: false
};

var Audio$1 = Specimen()(Audio);

var Color = function (_React$Component) {
  inherits(Color, _React$Component);

  function Color() {
    classCallCheck(this, Color);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Color.prototype.render = function render() {
    var _props = this.props,
        theme = _props.catalog.theme,
        value = _props.value,
        name = _props.name;

    var styles = {
      text: _extends({}, text(theme), {
        boxSizing: "border-box",
        padding: "8px 0",
        background: theme.background
      })
    };

    return React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css({ width: "100%" }, "label:Color;", "label:Color;") },
      React.createElement("div", { className: /*#__PURE__*/ /*#__PURE__*/css({ height: 120, background: value }, "label:Color;", "label:Color;") }),
      React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.text, "label:Color;", "label:Color;") },
        name,
        " ",
        React.createElement(
          "div",
          { className: /*#__PURE__*/ /*#__PURE__*/css({ fontFamily: theme.fontMono }, "label:Color;", "label:Color;") },
          value
        )
      )
    );
  };

  return Color;
}(React.Component);

Color.propTypes = {
  catalog: catalogShape.isRequired,
  value: PropTypes.string.isRequired,
  name: PropTypes.string
};

var Color$1 = Specimen()(Color);

var _ColorPaletteItem = function _ColorPaletteItem(_ref) {
  var name = _ref.name,
      value = _ref.value,
      styles = _ref.styles,
      width = _ref.width;

  var contrastingValue = hcl(value).l < 55 ? "#fff" : "#000";
  return React.createElement(
    "div",
    {
      className: /*#__PURE__*/ /*#__PURE__*/css(_extends({ width: width }, styles.paletteItem, { backgroundColor: value }), "label:_ColorPaletteItem;", "label:_ColorPaletteItem;")
    },
    React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.textPalette, { color: contrastingValue }), "label:_ColorPaletteItem;", "label:_ColorPaletteItem;") },
      name,
      " ",
      React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.mono, "label:_ColorPaletteItem;", "label:_ColorPaletteItem;") },
        value
      )
    )
  );
};

_ColorPaletteItem.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string.isRequired,
  styles: PropTypes.object,
  width: PropTypes.string
};

var ColorPaletteItem = _ColorPaletteItem;

var ColorPalette = function (_React$Component) {
  inherits(ColorPalette, _React$Component);

  function ColorPalette() {
    classCallCheck(this, ColorPalette);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  ColorPalette.prototype.render = function render() {
    var _props = this.props,
        theme = _props.catalog.theme,
        colors = _props.colors,
        horizontal = _props.horizontal;

    var styles = {
      container: {
        width: "100%",
        overflow: "hidden"
      },
      mono: {
        fontFamily: theme.fontMono
      },
      paletteItem: {
        float: "left",
        boxSizing: "border-box",
        padding: "20px 10px",
        "@media (max-width: 640px)": {
          width: "100%",
          float: "none"
        }
      },
      textPalette: _extends({}, text(theme), {
        fontFamily: theme.fontFamily,
        color: theme.textColor,
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden",
        opacity: 0.55,
        ":hover": {
          opacity: 1
        }
      }),
      info: {
        alignSelf: "flex-start",
        flex: "1 1 auto",
        width: "7em"
      }
    };

    var width = (horizontal ? 90 / colors.length : 100) + "%";
    var paletteItems = colors.map(function (color, i) {
      return React.createElement(ColorPaletteItem, _extends({ key: i }, color, { styles: styles, width: width }));
    });

    return React.createElement(
      "section",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.container, "label:ColorPalette;", "label:ColorPalette;") },
      paletteItems
    );
  };

  return ColorPalette;
}(React.Component);

ColorPalette.propTypes = {
  catalog: catalogShape.isRequired,
  colors: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string.isRequired
  })).isRequired,
  horizontal: PropTypes.bool
};

ColorPalette.defaultProps = {
  horizontal: false
};

var ColorPalette$1 = Specimen()(ColorPalette);

/*

Modified react-frame-component@0.4.0 which supports an onRender callback (e.g. to measure contents);
Original https://github.com/ryanseddon/react-frame-component/

*/

var hasConsole = typeof window !== "undefined" && window.console;
var noop = function noop() {};
var swallowInvalidHeadWarning = noop;
var resetWarnings = noop;

if (hasConsole) {
  var originalError = console.error; // eslint-disable-line no-console
  // Rendering a <head> into a body is technically invalid although it
  // works. We swallow React's validateDOMNesting warning if that is the
  // message to avoid confusion
  swallowInvalidHeadWarning = function swallowInvalidHeadWarning() {
    // eslint-disable-next-line no-console
    console.error = function (msg) {
      if (/<head>/.test(msg)) return;
      originalError.call(console, msg);
    };
  };
  resetWarnings = function resetWarnings() {
    console.error = originalError; // eslint-disable-line no-console
  };
}

var FrameComponent = function (_Component) {
  inherits(FrameComponent, _Component);

  function FrameComponent() {
    classCallCheck(this, FrameComponent);

    var _this = possibleConstructorReturn(this, _Component.call(this));

    _this.renderFrameContents = _this.renderFrameContents.bind(_this);
    return _this;
  }

  FrameComponent.prototype.componentDidMount = function componentDidMount() {
    this.renderFrameContents();
  };

  FrameComponent.prototype.componentDidUpdate = function componentDidUpdate() {
    this.renderFrameContents();
  };

  FrameComponent.prototype.componentWillUnmount = function componentWillUnmount() {
    var doc = this.iframe.contentDocument;
    if (doc) {
      unmountComponentAtNode(doc.body);
    }
  };

  FrameComponent.prototype.renderFrameContents = function renderFrameContents() {
    var _this2 = this;

    if (!this.iframe) {
      return;
    }

    var doc = this.iframe.contentDocument;

    if (doc && doc.readyState === "complete") {
      var contents = React.createElement(
        "div",
        null,
        this.props.head,
        this.props.children
      );

      // React warns when you render directly into the body since browser
      // extensions also inject into the body and can mess up React.
      doc.body.innerHTML = "<div></div>";
      doc.head.innerHTML = "";

      var base = doc.createElement("base");
      base.setAttribute("href", window.location.href);
      doc.head.appendChild(base);

      // Clone styles from parent document head into the iframe, so components which use webpack's style-loader get rendered correctly.
      // This doesn't clone any Catalog styles because they are either inline styles or part of the body.
      var pageStyles = Array.from(document.querySelectorAll('head > style, head > link[rel="stylesheet"]'));
      pageStyles.forEach(function (s) {
        doc.head.appendChild(s.cloneNode(true));
      });

      swallowInvalidHeadWarning();
      unstable_renderSubtreeIntoContainer(this, contents, doc.body.firstChild, function () {
        if (_this2.props.onRender) {
          raf(function () {
            _this2.props.onRender(doc.body.firstChild);
          });
        }
      });
      resetWarnings();
    } else {
      setTimeout(this.renderFrameContents, 0);
    }
  };

  FrameComponent.prototype.render = function render() {
    var _this3 = this;

    var style = this.props.style;

    return React.createElement("iframe", {
      ref: function ref(el) {
        _this3.iframe = el;
      },
      className: /*#__PURE__*/ /*#__PURE__*/css(style, "label:FrameComponent;", "label:FrameComponent;")
    });
  };

  return FrameComponent;
}(Component);

FrameComponent.propTypes = {
  style: PropTypes.object,
  head: PropTypes.node,
  onRender: PropTypes.func,
  children: PropTypes.node
};

var frameStyle = {
  width: "100%",
  height: "100%",
  lineHeight: 0,
  margin: 0,
  padding: 0,
  border: "none"
};

var renderStyles = function renderStyles(styles) {
  return styles.map(function (src, i) {
    return React.createElement("link", { key: i, href: src, rel: "stylesheet", type: "text/css" });
  });
};

var Frame = function (_Component) {
  inherits(Frame, _Component);

  function Frame() {
    classCallCheck(this, Frame);

    var _this = possibleConstructorReturn(this, _Component.call(this));

    _this.state = {};
    return _this;
  }

  Frame.prototype.render = function render() {
    var _this2 = this;

    var _props = this.props,
        children = _props.children,
        width = _props.width,
        parentWidth = _props.parentWidth,
        scrolling = _props.scrolling,
        background = _props.background;
    var styles = this.context.catalog.page.styles;

    var height = this.state.height || this.props.height;
    var autoHeight = !this.props.height;
    var scale = Math.min(1, parentWidth / width);
    var scaledHeight = autoHeight ? height : height * scale;

    return React.createElement(
      "div",
      {
        className: /*#__PURE__*/ /*#__PURE__*/css({
          lineHeight: 0,
          width: parentWidth,
          height: scaledHeight
        }, "label:Frame;", "label:Frame;")
      },
      React.createElement(
        "div",
        {
          style: {
            width: width,
            height: height,
            transformOrigin: "0% 0%",
            transform: "scale( " + scale + " )",
            overflow: "hidden"
          }
        },
        React.createElement(
          FrameComponent,
          {
            style: _extends({}, frameStyle, {
              background: background,
              overflow: scrolling ? "auto" : "hidden"
            }),
            head: [React.createElement(
              "style",
              { key: "stylereset" },
              "html,body{margin:0;padding:0;}"
            )].concat(renderStyles(styles)),
            onRender: autoHeight ? function (content) {
              var contentHeight = content.offsetHeight;
              if (contentHeight !== height) {
                _this2.setState({ height: contentHeight });
              }
            } : function () {
              return null;
            }
          },
          children
        )
      )
    );
  };

  return Frame;
}(Component);


Frame.propTypes = {
  children: PropTypes.element,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  parentWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  scrolling: PropTypes.bool,
  background: PropTypes.string
};

Frame.contextTypes = {
  catalog: catalogShape.isRequired
};

/* eslint-disable */

var ReactParser = function (_marked$Parser) {
  inherits(ReactParser, _marked$Parser);

  function ReactParser() {
    classCallCheck(this, ReactParser);
    return possibleConstructorReturn(this, _marked$Parser.apply(this, arguments));
  }

  ReactParser.parse = function parse$$1(src, options) {
    var parser = new ReactParser(options);
    return parser.parse(src);
  };

  ReactParser.prototype.parse = function parse$$1(src) {
    this.inline = new ReactInlineLexer(src.links, this.options);
    // use an InlineLexer with a TextRenderer to extract pure text
    this.inlineText = new marked.InlineLexer(src.links, Object.assign({}, this.options, { renderer: new marked.TextRenderer() }));
    this.tokens = src.reverse();

    var out = [];
    while (this.next()) {
      out.push(this.tok());
    }

    return out;
  };

  ReactParser.prototype.tok = function tok() {
    switch (this.token.type) {
      case "space":
        {
          return "";
        }
      case "hr":
        {
          return this.renderer.hr();
        }
      case "heading":
        {
          return this.renderer.heading(this.inline.output(this.token.text), this.token.depth, unescape(this.inlineText.output(this.token.text)));
        }
      case "code":
        {
          return this.renderer.code(this.token.text, this.token.lang, this.token.escaped);
        }
      case "table":
        {
          var header = [],
              body = [],
              i,
              row,
              cell,
              j;

          // header
          cell = [];
          for (i = 0; i < this.token.header.length; i++) {
            cell.push(this.renderer.tablecell(this.inline.output(this.token.header[i]), {
              header: true,
              align: this.token.align[i]
            }));
          }
          header.push(this.renderer.tablerow(cell));

          for (i = 0; i < this.token.cells.length; i++) {
            row = this.token.cells[i];

            cell = [];
            for (j = 0; j < row.length; j++) {
              cell.push(this.renderer.tablecell(this.inline.output(row[j]), {
                header: false,
                align: this.token.align[j]
              }));
            }

            body.push(this.renderer.tablerow(cell));
          }
          return this.renderer.table(header, body);
        }
      case "blockquote_start":
        {
          body = [];

          while (this.next().type !== "blockquote_end") {
            body.push(this.tok());
          }

          return this.renderer.blockquote(body);
        }
      case "list_start":
        {
          body = [];
          var ordered = this.token.ordered,
              start = this.token.start;

          while (this.next().type !== "list_end") {
            body.push(this.tok());
          }

          return this.renderer.list(body, ordered, start);
        }
      case "list_item_start":
        {
          body = [];

          if (this.token.task) {
            body.push(this.renderer.checkbox(this.token.checked));
          }

          while (this.next().type !== "list_item_end") {
            body.push(this.token.type === "text" ? this.parseText() : this.tok());
          }

          return this.renderer.listitem(body);
        }
      case "loose_item_start":
        {
          body = [];

          while (this.next().type !== "list_item_end") {
            body.push(this.tok());
          }

          return this.renderer.listitem(body);
        }
      case "html":
        {
          // TODO parse inline content if parameter markdown=1
          return this.renderer.html(this.token.text);
        }
      case "paragraph":
        {
          return this.renderer.paragraph(this.inline.output(this.token.text));
        }
      case "text":
        {
          return this.renderer.paragraph(this.parseText());
        }
    }
  };

  return ReactParser;
}(marked.Parser);

var ReactInlineLexer = function (_marked$InlineLexer) {
  inherits(ReactInlineLexer, _marked$InlineLexer);

  function ReactInlineLexer() {
    classCallCheck(this, ReactInlineLexer);
    return possibleConstructorReturn(this, _marked$InlineLexer.apply(this, arguments));
  }

  ReactInlineLexer.prototype.output = function output(src) {
    var out = [],
        link = void 0,
        text = void 0,
        href = void 0,
        title = void 0,
        cap = void 0,
        prevCapZero = void 0;

    while (src) {
      // escape
      if (cap = this.rules.escape.exec(src)) {
        src = src.substring(cap[0].length);
        out.push(cap[1]);
        continue;
      }

      // autolink
      if (cap = this.rules.autolink.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[2] === "@") {
          text = escape(this.mangle(cap[1]));
          href = "mailto:" + text;
        } else {
          text = escape(cap[1]);
          href = text;
        }
        out.push(this.renderer.link(href, null, text));
        continue;
      }

      // url (gfm)
      if (!this.inLink && (cap = this.rules.url.exec(src))) {
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules._backpedal.exec(cap[0])[0];
        } while (prevCapZero !== cap[0]);
        src = src.substring(cap[0].length);
        if (cap[2] === "@") {
          text = escape(cap[0]);
          href = "mailto:" + text;
        } else {
          text = escape(cap[0]);
          if (cap[1] === "www.") {
            href = "http://" + text;
          } else {
            href = text;
          }
        }
        out.push(this.renderer.link(href, null, text));
        continue;
      }

      // tag
      if (cap = this.rules.tag.exec(src)) {
        if (!this.inLink && /^<a /i.test(cap[0])) {
          this.inLink = true;
        } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
          this.inLink = false;
        }
        src = src.substring(cap[0].length);
        out.push(this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]) : cap[0]);
        continue;
      }

      // link
      if (cap = this.rules.link.exec(src)) {
        src = src.substring(cap[0].length);
        this.inLink = true;
        href = cap[2];
        if (this.options.pedantic) {
          link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

          if (link) {
            href = link[1];
            title = link[3];
          } else {
            title = "";
          }
        } else {
          title = cap[3] ? cap[3].slice(1, -1) : "";
        }
        href = href.trim().replace(/^<([\s\S]*)>$/, "$1");
        out.push(this.outputLink(cap, {
          href: ReactInlineLexer.escapes(href),
          title: ReactInlineLexer.escapes(title)
        }));
        this.inLink = false;
        continue;
      }

      // reflink, nolink
      if ((cap = this.rules.reflink.exec(src)) || (cap = this.rules.nolink.exec(src))) {
        src = src.substring(cap[0].length);
        link = (cap[2] || cap[1]).replace(/\s+/g, " ");
        link = this.links[link.toLowerCase()];
        if (!link || !link.href) {
          out.push(cap[0].charAt(0));
          src = cap[0].substring(1) + src;
          continue;
        }
        this.inLink = true;
        out.push(this.outputLink(cap, link));
        this.inLink = false;
        continue;
      }

      // strong
      if (cap = this.rules.strong.exec(src)) {
        src = src.substring(cap[0].length);
        out.push(this.renderer.strong(this.output(cap[4] || cap[3] || cap[2] || cap[1])));
        continue;
      }

      // em
      if (cap = this.rules.em.exec(src)) {
        src = src.substring(cap[0].length);
        out.push(this.renderer.em(this.output(cap[6] || cap[5] || cap[4] || cap[3] || cap[2] || cap[1])));
        continue;
      }

      // code
      if (cap = this.rules.code.exec(src)) {
        src = src.substring(cap[0].length);
        out.push(this.renderer.codespan(escape(cap[2].trim(), true)));
        continue;
      }

      // br
      if (cap = this.rules.br.exec(src)) {
        src = src.substring(cap[0].length);
        out.push(this.renderer.br());
        continue;
      }

      // del (gfm)
      if (cap = this.rules.del.exec(src)) {
        src = src.substring(cap[0].length);
        out.push(this.renderer.del(this.output(cap[1])));
        continue;
      }

      // text
      if (cap = this.rules.text.exec(src)) {
        src = src.substring(cap[0].length);
        out.push(escape(this.smartypants(cap[0])));
        continue;
      }

      if (src) {
        throw new Error("Infinite loop on byte: " + src.charCodeAt(0));
      }
    }

    return out;
  };

  return ReactInlineLexer;
}(marked.InlineLexer);

function escape(html, encode) {
  return html;
}

var Marked = function Marked(src, opt, callback) {
  return ReactParser.parse(marked.lexer(src), opt);
};

var Link$1 = function Link$$1(_ref, _ref2) {
  var catalog = _ref2.catalog;
  var to = _ref.to,
      rest = objectWithoutProperties(_ref, ["to"]);

  var parsedTo = parsePath(to, catalog);
  return isInternalPath(parsedTo, catalog) ? React.createElement(Link, _extends({ to: parsedTo }, rest)) : React.createElement("a", _extends({ href: getPublicPath(to, catalog) }, rest));
};

Link$1.propTypes = {
  to: PropTypes.string.isRequired
};

Link$1.contextTypes = {
  catalog: catalogShape.isRequired
};

var style = function style(theme) {
  return {
    headingLink: {
      color: theme.lightColor,
      textDecoration: "none",
      ":hover": {
        color: theme.linkColor
      }
    }
  };
};

var HeadingLink = function HeadingLink(_ref, _ref2) {
  var catalog = _ref2.catalog;
  var slug = _ref.slug,
      rest = objectWithoutProperties(_ref, ["slug"]);

  return React.createElement(
    Link$1,
    _extends({
      className: "HeadingLink " + /*#__PURE__*/css(style(catalog.theme).headingLink, "label:HeadingLink;"),
      title: "Link to this section",
      to: "#" + slug,
      "aria-hidden": true
    }, rest),
    "#"
  );
};

HeadingLink.propTypes = {
  slug: PropTypes.string.isRequired
};

HeadingLink.contextTypes = {
  catalog: catalogShape.isRequired
};

var HeadingWithLink = function HeadingWithLink(_ref) {
  var _babelHelpers$extends;

  var level = _ref.level,
      text$$1 = _ref.text,
      slug = _ref.slug,
      theme = _ref.catalog.theme;

  var tag = "h" + level;

  var linkStyle = /*#__PURE__*/css({ display: "none" }, "label:linkStyle;");

  var headingStyle = /*#__PURE__*/css(_extends({}, heading(theme, 5 - level), (_babelHelpers$extends = {
    flexBasis: "100%",
    margin: "48px 0 0 0",
    "blockquote + &, h1 + &, h2 + &, h3 + &, h4 + &, h5 + &, h6 + &": {
      margin: "16px 0 0 0"
    }
  }, _babelHelpers$extends["&:hover ." + linkStyle] = { display: "inline" }, _babelHelpers$extends)), { label: tag }, "label:headingStyle;");

  return React.createElement(tag, { id: slug, className: headingStyle }, text$$1, " ", React.createElement(
    "span",
    { className: linkStyle },
    React.createElement(HeadingLink, { slug: slug })
  ));
};

var PlainHeading = function PlainHeading(_ref2) {
  var level = _ref2.level,
      text$$1 = _ref2.text;

  var tag = "h" + level;
  return React.createElement(tag, null, text$$1);
};

var Heading = function Heading(_ref3, _ref4) {
  var level = _ref3.level,
      text$$1 = _ref3.text,
      slug = _ref3.slug;
  var catalog = _ref4.catalog;
  return slug ? React.createElement(HeadingWithLink, { level: level, text: text$$1, slug: slug, catalog: catalog }) : React.createElement(PlainHeading, { level: level, text: text$$1, catalog: catalog });
};

Heading.propTypes = HeadingWithLink.propTypes = PlainHeading.propTypes = {
  level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]).isRequired,
  text: PropTypes.array.isRequired,
  slug: PropTypes.string
};

Heading.contextTypes = {
  catalog: catalogShape.isRequired
};

var styled = function styled(tag, styles) {
  // eslint-disable-next-line react/prop-types
  var Styled = function Styled(_ref, _ref2) {
    var catalog = _ref2.catalog;
    var className = _ref.className,
        props = objectWithoutProperties(_ref, ["className"]);
    return React.createElement(tag, _extends({}, props, {
      className: cx( /*#__PURE__*/css(typeof styles === "function" ? styles(props, catalog) : styles, {
        label: tag
      }, "label:Styled;"), className)
    }));
  };

  Styled.displayName = "Styled." + tag;
  Styled.contextTypes = { catalog: PropTypes.object.isRequired };

  return Styled;
};

var baseListStyle = {
  width: "100%",
  marginLeft: 0,
  paddingLeft: "2rem"
};

// Defined with `css`, so it can be used as a selector for nested elements
// For example: `Paragraph`
var blockquoteStyle = function blockquoteStyle() {
  return (/*#__PURE__*/css({
      quotes: "none",
      margin: "48px 0 32px 0",
      width: "100%",
      "&::before, &::after": { content: "none" },
      "& > :first-child": { marginTop: 0 },
      "& > :last-child": { marginBottom: 0 },
      "& + &": { marginTop: 0 }
    }, "label:blockquoteStyle;")
  );
};

var Paragraph = styled("p", function (props, _ref) {
  var _babelHelpers$extends;

  var theme = _ref.theme;
  return _extends({}, text(theme), (_babelHelpers$extends = {
    flexBasis: "100%"
  }, _babelHelpers$extends["." + blockquoteStyle() + " &"] = { fontSize: getFontSize(theme, 1) }, _babelHelpers$extends.margin = "16px 0 0 0", _babelHelpers$extends));
});
var UnorderedList = styled("ul", _extends({}, baseListStyle, {
  listStyle: "disc",
  marginTop: "16px",
  marginBottom: 0,
  "& > li": { listStyle: "disc" }
}));
var OrderedList = styled("ol", _extends({}, baseListStyle, {
  listStyle: "ordinal",
  marginTop: "16px",
  marginBottom: 0,
  "& > li": { listStyle: "ordinal" }
}));
var ListItem = styled("li", function (props, _ref2) {
  var _babelHelpers$extends2;

  var theme = _ref2.theme;
  return _extends({}, text(theme), (_babelHelpers$extends2 = {}, _babelHelpers$extends2["." + blockquoteStyle() + " &"] = { fontSize: getFontSize(theme, 1) }, _babelHelpers$extends2.margin = 0, _babelHelpers$extends2.padding = 0, _babelHelpers$extends2["& > :first-child, & > ul, & > ol"] = { marginTop: 0 }, _babelHelpers$extends2["& > :last-child"] = { marginBottom: 0 }, _babelHelpers$extends2));
});
var BlockQuote = function BlockQuote(props) {
  return React.createElement("blockquote", _extends({ className: blockquoteStyle() }, props));
};
var Hr = styled("hr", {
  border: "none",
  flexBasis: "100%",
  margin: 0,
  height: 0
});
var Em = styled("em", { fontStyle: "italic" });
var Strong = styled("strong", {
  fontWeight: 700
});
var CodeSpan = styled("code", function (props, _ref3) {
  var theme = _ref3.theme;
  return {
    background: theme.bgLight,
    border: "1px solid #eee",
    borderRadius: 1,
    display: "inline-block",
    fontFamily: theme.fontMono,
    fontSize: Math.pow(theme.msRatio, -0.5) + "em",
    lineHeight: 1,
    padding: "0.12em 0.2em",
    textIndent: 0
  };
});
var Del = styled("del", {
  textDecoration: "line-through"
});
var Image = styled("img", {
  maxWidth: "100%"
});

var Link$2 = function Link$$1(props, _ref4) {
  var theme = _ref4.catalog.theme;

  var baseLinkStyle = {
    color: theme.linkColor,
    transition: "none",
    border: "none",
    background: "none",
    textDecoration: "none"
  };
  return React.createElement(Link$1, _extends({
    className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, baseLinkStyle, {
      "&:active, &:visited": baseLinkStyle,
      "&:hover, &:focus": _extends({}, baseLinkStyle, {
        textDecoration: "underline"
      })
    }), "label:Link;", "label:Link;")
  }, props));
};

Link$2.contextTypes = {
  catalog: catalogShape
};

var ReactRenderer = function () {
  function ReactRenderer() {
    classCallCheck(this, ReactRenderer);

    this.slugger = new Slugger();
    this.itemsRenderedCount = 0;
  }

  ReactRenderer.prototype.getKey = function getKey() {
    return this.itemsRenderedCount++;
  };

  ReactRenderer.prototype.code = function code(_code, lang /* , escaped*/) {
    return React.createElement(
      "pre",
      { key: this.getKey() },
      React.createElement(
        "code",
        { className: lang },
        _code
      )
    );
  };

  ReactRenderer.prototype.blockquote = function blockquote(quote) {
    return React.createElement(
      BlockQuote,
      { key: this.getKey() },
      quote
    );
  };

  ReactRenderer.prototype.heading = function heading(text, level, raw) {
    var slug = this.slugger.slug(raw);
    return React.createElement(Heading, { text: text, level: level, slug: slug });
  };

  ReactRenderer.prototype.hr = function hr() {
    return React.createElement(Hr, { key: this.getKey() });
  };

  ReactRenderer.prototype.br = function br() {
    return React.createElement("br", { key: this.getKey() });
  };

  ReactRenderer.prototype.list = function list(body, ordered) {
    var key = this.getKey();
    return ordered ? React.createElement(
      OrderedList,
      { key: key },
      body
    ) : React.createElement(
      UnorderedList,
      { key: key },
      body
    );
  };

  ReactRenderer.prototype.listitem = function listitem(text) {
    return React.createElement(
      ListItem,
      { key: this.getKey() },
      text
    );
  };

  ReactRenderer.prototype.paragraph = function paragraph(text) {
    return React.createElement(
      Paragraph,
      { key: this.getKey() },
      text
    );
  };

  ReactRenderer.prototype.table = function table(header, body) {
    return React.createElement(
      "table",
      { key: this.getKey() },
      React.createElement(
        "thead",
        null,
        header
      ),
      React.createElement(
        "tbody",
        null,
        body
      )
    );
  };

  ReactRenderer.prototype.tablerow = function tablerow(content) {
    return React.createElement(
      "tr",
      { key: this.getKey() },
      content
    );
  };

  ReactRenderer.prototype.tablecell = function tablecell(content) {
    return React.createElement(
      "td",
      { key: this.getKey() },
      content
    );
  };

  ReactRenderer.prototype.strong = function strong(content) {
    return React.createElement(
      Strong,
      { key: this.getKey() },
      content
    );
  };

  ReactRenderer.prototype.em = function em(content) {
    return React.createElement(
      Em,
      { key: this.getKey() },
      content
    );
  };

  ReactRenderer.prototype.codespan = function codespan(content) {
    return React.createElement(
      CodeSpan,
      { key: this.getKey() },
      content
    );
  };

  ReactRenderer.prototype.del = function del(content) {
    return React.createElement(
      Del,
      { key: this.getKey() },
      content
    );
  };

  ReactRenderer.prototype.link = function link(href, title, text) {
    return React.createElement(
      Link$2,
      { to: href, title: title, key: this.getKey() },
      text
    );
  };

  ReactRenderer.prototype.image = function image(href, title, alt) {
    return React.createElement(Image, { src: href, title: title, alt: alt, key: this.getKey() });
  };

  ReactRenderer.prototype.html = function html(_html) {
    return React.createElement("div", {
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML: { __html: _html.join("") },
      key: this.getKey()
    });
  };

  return ReactRenderer;
}();

var MARKDOWN_CONFIG = {
  gfm: true,
  breaks: true,
  sanitize: false,
  smartLists: true,
  smartypants: true
};

var renderMarkdown = (function (_ref) {
  var text = _ref.text,
      renderer = _ref.renderer;

  return Marked(text, _extends({}, MARKDOWN_CONFIG, {
    renderer: Object.assign(new ReactRenderer(), renderer)
  }));
});

function getStyle$2(theme) {
  return {
    container: {
      flexBasis: "100%"
    },
    hint: _extends({}, text(theme), {
      background: "#fff6dd",
      border: "1px solid #ffefaa",
      borderRadius: "2px",
      color: "#966900",
      padding: "20px",
      "& code": {
        display: "inline-block",
        border: "1px solid rgba(0,0,0,.035)",
        borderRadius: 1,
        background: "rgba(0,0,0,.03)",
        fontFamily: theme.fontMono,
        fontSize: Math.pow(theme.msRatio, -0.5) + "em",
        lineHeight: 1,
        padding: "0.12em 0.2em",
        textIndent: 0
      },
      "& :first-child": {
        marginTop: 0
      },
      "& :last-child": {
        marginBottom: 0
      },
      "& a, & a:hover, & a:visited": {
        color: "currentColor",
        textDecoration: "underline"
      },
      "& a:focus": {
        color: theme.linkColor
      },
      "& p, & ul, & ol, & li, & blockquote": {
        color: "currentColor"
      }
    }),
    neutral: {
      // Contrast: AAA / AA
      background: "#f9f9f9",
      color: "#666666",
      border: "1px solid #eee"
    },
    important: {
      // Contrast: AAA / AAA
      background: "#ffffff",
      color: "#333333",
      border: "1px solid #eee"
    },
    warning: {
      // Contrast: AAA / AA
      background: "#fff5f5",
      border: "1px solid #ffdddd",
      color: "#ce3737"
    },
    directive: {
      // Contrast: AAA / AA
      background: "#eafaea",
      border: "1px solid #bbebc8",
      color: "#1d7d3f"
    }
  };
}

var Hint = function (_React$Component) {
  inherits(Hint, _React$Component);

  function Hint() {
    classCallCheck(this, Hint);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Hint.prototype.render = function render() {
    var _cx;

    var _props = this.props,
        theme = _props.catalog.theme,
        children = _props.children,
        warning = _props.warning,
        neutral = _props.neutral,
        important = _props.important,
        directive = _props.directive;

    var styles = getStyle$2(theme);

    var hintStyle = cx( /*#__PURE__*/css(styles.hint, "label:hintStyle;"), (_cx = {}, _cx[/*#__PURE__*/ /*#__PURE__*/css(styles.warning, "label:hintStyle;", "label:hintStyle;")] = warning, _cx[/*#__PURE__*/ /*#__PURE__*/css(styles.directive, "label:hintStyle;", "label:hintStyle;")] = directive, _cx[/*#__PURE__*/ /*#__PURE__*/css(styles.neutral, "label:hintStyle;", "label:hintStyle;")] = neutral, _cx[/*#__PURE__*/ /*#__PURE__*/css(styles.important, "label:hintStyle;", "label:hintStyle;")] = important, _cx));

    var markdownRenderer = {
      heading: function heading$$1(textParts, level, raw) {
        var slug = this.slugger.slug(raw);
        return React.createElement("h" + level, {
          key: slug,
          id: slug,
          className: /*#__PURE__*/css(_extends({}, heading(theme, Math.max(0, 3 - level)), {
            color: "currentColor",
            margin: "48px 0 0 0",
            "blockquote + &, h1 + &, h2 + &, h3 + &, h4 + &, h5 + &, h6 + &": {
              margin: "16px 0 0 0"
            }
          }), "label:markdownRenderer;")
        }, textParts);
      }
    };

    return React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.container, "label:Hint;", "label:Hint;") },
      React.createElement(
        "section",
        { className: hintStyle },
        typeof children === "string" ? renderMarkdown({
          text: children,
          renderer: markdownRenderer
        }) : children
      )
    );
  };

  return Hint;
}(React.Component);

Hint.propTypes = {
  children: PropTypes.node.isRequired,
  catalog: catalogShape.isRequired,
  warning: PropTypes.bool,
  neutral: PropTypes.bool,
  important: PropTypes.bool,
  directive: PropTypes.bool
};

var Hint$1 = Specimen(undefined, undefined, { withChildren: true })(Hint);

/**
 * Generates a small preview showing the aspect ratio
 */

var Preview = function Preview(_ref) {
  var proportion = _ref.proportion;
  return React.createElement(
    "div",
    {
      className: /*#__PURE__*/ /*#__PURE__*/css({
        width: "30px",
        height: "30px",
        display: "inline-block",
        marginRight: 5
      }, "label:Preview;", "label:Preview;")
    },
    React.createElement(
      "svg",
      { viewBox: "0 0 2 2" },
      React.createElement("rect", {
        className: /*#__PURE__*/ /*#__PURE__*/css({ fill: "#ccc" }, "label:Preview;", "label:Preview;"),
        width: proportion,
        height: 1,
        x: (2 - proportion) * 0.5,
        y: "0.5"
      })
    )
  );
};

Preview.propTypes = {
  proportion: PropTypes.number.isRequired
};

function getStyle$3(theme) {
  return {
    tabContainer: {
      background: "white",
      display: "flex",
      overflowX: "auto",
      width: "100%",
      flexShrink: 0
    },
    tab: _extends({}, text(theme), {
      alignItems: "center",
      background: "#eee",
      boxSizing: "border-box",
      color: "#777",
      cursor: "pointer",
      display: "flex",
      lineHeight: theme.msRatio,
      flexBasis: "100%",
      flexDirection: "row",
      padding: "10px",
      transition: ".2s background-color, .4s color"
    }),
    tabActive: {
      background: "white",
      fontWeight: "bold",
      color: theme.brandColor,
      cursor: "auto"
    },
    description: {
      paddingLeft: 5
    },
    tabDimension: {
      color: "#777",
      display: "block",
      fontFamily: theme.fontMono,
      fontSize: "smaller",
      fontWeight: "normal",
      marginTop: 2,
      opacity: 0.6
    }
  };
}

var ResponsiveTabs = function ResponsiveTabs(_ref) {
  var sizes = _ref.sizes,
      action = _ref.action,
      activeSize = _ref.activeSize,
      theme = _ref.theme,
      parentWidth = _ref.parentWidth;

  var styles = getStyle$3(theme);
  return React.createElement(
    "div",
    { className: /*#__PURE__*/ /*#__PURE__*/css(styles.tabContainer, "label:ResponsiveTabs;", "label:ResponsiveTabs;") },
    sizes.map(function (val, i) {
      var isTabActive = activeSize.name === val.name;
      var activeStyles = isTabActive && styles.tabActive;
      return React.createElement(
        "div",
        {
          key: i,
          className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.tab, activeStyles), "label:ResponsiveTabs;", "label:ResponsiveTabs;"),
          onClick: function onClick() {
            return action(val);
          }
        },
        React.createElement(Preview, { proportion: val.width / val.height }),
        React.createElement(
          "div",
          { className: /*#__PURE__*/ /*#__PURE__*/css(styles.description, "label:ResponsiveTabs;", "label:ResponsiveTabs;") },
          val.name,
          React.createElement(
            "div",
            { className: /*#__PURE__*/ /*#__PURE__*/css(styles.tabDimension, "label:ResponsiveTabs;", "label:ResponsiveTabs;") },
            val.width,
            "\xD7",
            val.height,
            "\u2009",
            parentWidth <= val.width && "(scaled)"
          )
        )
      );
    })
  );
};

ResponsiveTabs.propTypes = {
  sizes: PropTypes.array,
  action: PropTypes.func,
  activeSize: PropTypes.object,
  theme: PropTypes.object,
  parentWidth: PropTypes.number
};

//
// Sequentially runs scripts as they are added
//

var current = null;
var queue = [];
var dequeue = function dequeue(handler) {
  current = handler();
  current.then(function () {
    current = null;
    if (queue.length > 0) {
      return dequeue(queue.shift());
    }
    return void 0;
  });
  return current.catch(function () {
    throw new Error("Error loading script");
  });
};
var enqueue = function enqueue(handler) {
  if (current !== null) {
    return queue.push(handler);
  }
  return dequeue(handler);
};
var execScript = function execScript(decorate) {
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  decorate(script);
  var head$$1 = document.getElementsByTagName("head")[0] || document.documentElement;
  return head$$1.appendChild(script);
};
var execRemote = function execRemote(src) {
  return function () {
    return new Promise(function (resolve, reject) {
      return execScript(function (script) {
        script.addEventListener("load", resolve, false);
        script.addEventListener("error", reject, false);
        return script.setAttribute("src", src);
      });
    });
  };
};
var execInline = function execInline(src) {
  return function () {
    return new Promise(function (resolve) {
      return execScript(function (script) {
        script.appendChild(document.createTextNode(src));
        return resolve();
      });
    });
  };
};

var runscript = (function (srcOrEl) {
  if (is(String, srcOrEl) && !isEmpty(srcOrEl.trim())) {
    enqueue(execRemote(srcOrEl));
  }
  if (srcOrEl.textContent && !isEmpty(srcOrEl.textContent.trim())) {
    return enqueue(execInline(srcOrEl.textContent));
  }
  return void 0;
});

/**
 * Checks if the delivered props are valid, returns false if not, otherwise a filtered Array
 */

var validateSizes = function validateSizes(input, catalogSizes) {
  var isArray = Array.isArray(input);
  if (input === true) {
    return catalogSizes;
  } else if (typeof input === "string") {
    var foundInList = catalogSizes.find(function (val) {
      return input === val.name;
    });
    return foundInList ? [].concat(foundInList) : false;
  } else if (isArray && input.length === input.filter(function (item) {
    return typeof item === "string";
  }).length) {
    var filtered = input.map(function (name) {
      return catalogSizes.find(function (size) {
        return size.name === name;
      });
    }).filter(Boolean);
    return filtered.length === input.length ? filtered : false;
  }
  return false;
};

var PADDING = 3;
var SIZE = 20;

function getStyle$4(theme) {
  return {
    container: {
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: "2px",
      boxSizing: "border-box",
      position: "relative",
      flexBasis: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column"
    },
    toggle: {
      border: PADDING + "px solid transparent",
      color: theme.lightColor,
      cursor: "pointer",
      display: "inline-block",
      fontFamily: theme.fontMono,
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 700,
      height: SIZE + "px",
      lineHeight: SIZE + "px",
      padding: PADDING + "px",
      position: "absolute",
      right: -PADDING + "px",
      top: -(SIZE + 2 * PADDING) + "px",
      userSelect: "none",
      ":hover": {
        color: theme.textColor
      }
    },
    source: {
      borderTop: "1px solid #eee",
      boxSizing: "border-box",
      width: "100%",
      height: "auto"
    },
    content: {
      background: "url(" + theme.checkerboardPatternLight + ")",
      boxSizing: "border-box",
      display: "block",
      padding: 20,
      position: "relative",
      width: "100%",
      height: "100%"
    },
    light: {
      background: "url(" + theme.checkerboardPatternLight + ")"
    },
    dark: {
      background: "url(" + theme.checkerboardPatternDark + ")"
    },
    plain: {
      background: "transparent",
      padding: 0
    },
    plain_light: {
      background: theme.bgLight,
      padding: "20px"
    },
    plain_dark: {
      background: theme.bgDark,
      padding: "20px"
    },
    responsive: {
      boxSizing: "border-box",
      overflow: "hidden",
      padding: "15px",
      textAlign: "center"
    }
  };
}

var Html = function (_React$Component) {
  inherits(Html, _React$Component);

  function Html(props) {
    classCallCheck(this, Html);

    var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.state = {
      viewSource: !!props.showSource,
      parentWidth: 0,
      activeScreenSize: validateSizes(props.responsive, props.catalog.responsiveSizes)[0] || null
    };
    _this.setSize = _this.setSize.bind(_this);
    _this.updateParentWidth = _this.updateParentWidth.bind(_this);
    return _this;
  }

  Html.prototype.componentDidMount = function componentDidMount() {
    var runScript = this.props.runScript;

    runScript && Array.from(this.specimen.querySelectorAll("script")).forEach(runscript);

    if (this.state.activeScreenSize) {
      window.addEventListener("resize", this.updateParentWidth);
      setTimeout(this.updateParentWidth);
    }
  };

  Html.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.state.activeScreenSize) {
      window.removeEventListener("resize", this.updateParentWidth);
    }
  };

  Html.prototype.setElementState = function setElementState(nextState) {
    if (typeof nextState === "function") {
      this.setState(function (_ref) {
        var elementState = _ref.elementState;
        return {
          elementState: _extends({}, elementState, nextState(elementState))
        };
      });
    } else {
      this.setState({
        elementState: _extends({}, this.state.elementState, nextState)
      });
    }
  };

  Html.prototype.updateParentWidth = function updateParentWidth() {
    if (!this.specimen) {
      return;
    }
    var nextParentWidth = this.specimen.getBoundingClientRect().width - 30;
    if (nextParentWidth !== this.state.parentWidth) {
      this.setState({ parentWidth: nextParentWidth });
    }
  };

  Html.prototype.setSize = function setSize(activeScreenSize) {
    this.setState({ activeScreenSize: activeScreenSize });
  };

  Html.prototype.toggleSource = function toggleSource() {
    this.setState(function (_ref2) {
      var viewSource = _ref2.viewSource;
      return { viewSource: !viewSource };
    });
  };

  Html.prototype.render = function render() {
    var _this2 = this;

    var _props = this.props,
        _props$catalog = _props.catalog,
        theme = _props$catalog.theme,
        responsiveSizes = _props$catalog.responsiveSizes,
        children = _props.children,
        frame = _props.frame,
        options = objectWithoutProperties(_props, ["catalog", "children", "frame"]);
    var _state = this.state,
        activeScreenSize = _state.activeScreenSize,
        parentWidth = _state.parentWidth,
        viewSource = _state.viewSource;

    var styles = getStyle$4(theme);
    var validSizes = validateSizes(options.responsive, responsiveSizes);

    var exampleStyles = _extends({}, options.plain ? styles.plain : null, options.light ? styles.light : null, options.dark ? styles.dark : null, options.plain && options.light ? styles.plain_light : null, options.plain && options.dark ? styles.plain_dark : null, options.responsive ? styles.responsive : null);

    var frameBackground = options.responsive ? exampleStyles.background || styles.content.background : undefined;
    var exampleBackground = options.responsive ? "white" : exampleStyles.background || styles.content.background;

    var source = viewSource ? React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.source, "label:source;", "label:source;") },
      React.createElement(HighlightedCode, { language: "markup", code: children, theme: theme })
    ) : null;

    var toggle = !options.noSource ? React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.toggle, "label:toggle;", "label:toggle;"), onClick: function onClick() {
          return _this2.toggleSource();
        } },
      "<>"
    ) : null;

    // eslint-disable-next-line
    var content = React.createElement("div", { dangerouslySetInnerHTML: { __html: children } });

    if (options.responsive && !validSizes) {
      return React.createElement(
        Hint$1,
        { warning: true },
        "Please check that the responsive parameters match an existing entry."
      );
    }

    return React.createElement(
      "div",
      {
        className: /*#__PURE__*/ /*#__PURE__*/css(styles.container, "label:Html;", "label:Html;"),
        ref: function ref(el) {
          _this2.specimen = el;
        }
      },
      toggle,
      options.responsive && parentWidth && activeScreenSize && React.createElement(ResponsiveTabs, {
        theme: theme,
        sizes: validSizes,
        action: this.setSize,
        activeSize: activeScreenSize,
        parentWidth: parentWidth
      }),
      (!options.responsive || parentWidth) && React.createElement(
        "div",
        {
          className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.content, exampleStyles, {
            background: exampleBackground
          }), "label:Html;", "label:Html;")
        },
        frame || activeScreenSize ? React.createElement(
          Frame,
          {
            width: activeScreenSize && activeScreenSize.width,
            parentWidth: parentWidth ? parentWidth : "100%",
            height: activeScreenSize && activeScreenSize.height,
            scrolling: frame ? false : true,
            background: frameBackground
          },
          content
        ) : content
      ),
      source
    );
  };

  return Html;
}(React.Component);

Html.propTypes = {
  children: PropTypes.string.isRequired,
  catalog: catalogShape.isRequired,
  responsive: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  runScript: PropTypes.bool,
  plain: PropTypes.bool,
  light: PropTypes.bool,
  dark: PropTypes.bool,
  noSource: PropTypes.bool,
  showSource: PropTypes.bool,
  frame: PropTypes.bool
};

var Html$1 = Specimen(undefined, undefined, { withChildren: true })(Html);

var Image$1 = function (_React$Component) {
  inherits(Image, _React$Component);

  function Image() {
    classCallCheck(this, Image);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Image.prototype.render = function render() {
    var _props = this.props,
        catalog = _props.catalog,
        src = _props.src,
        title = _props.title,
        overlay = _props.overlay,
        description = _props.description,
        options = objectWithoutProperties(_props, ["catalog", "src", "title", "overlay", "description"]);
    var theme = catalog.theme;
    var _options$scale = options.scale,
        scale = _options$scale === undefined ? true : _options$scale,
        _options$imageContain = options.imageContainerStyle,
        imageContainerStyle = _options$imageContain === undefined ? {} : _options$imageContain;


    var styles = {
      container: {
        position: "relative",
        width: "100%"
      },
      imageContainer: _extends({
        boxSizing: "border-box",
        padding: "20px",
        background: "url(" + theme.checkerboardPatternLight + ")",
        color: theme.textColor,
        overflowX: "auto"
      }, imageContainerStyle),
      image: _extends({
        display: "block"
      }, scale ? { maxWidth: "100%" } : {}),
      overlay: {
        boxSizing: "border-box",
        opacity: 0,
        width: "100%",
        position: "absolute",
        padding: 20,
        top: 0,
        left: 0,
        ":hover": {
          opacity: 1
        }
      },
      meta: {
        margin: "20px 0 0 0"
      },
      title: _extends({}, heading(theme, 0), {
        color: theme.textColor,
        fontWeight: 700,
        margin: "0 0 8px 0"
      }),
      description: _extends({}, text(theme, -1), {
        ":first-child": {
          marginTop: 0
        },
        ":last-child": {
          marginBottom: 0
        }
      }),
      light: {
        background: "url(" + theme.checkerboardPatternLight + ")"
      },
      dark: {
        background: "url(" + theme.checkerboardPatternDark + ")"
      },
      plain: {
        background: "transparent",
        padding: 0
      },
      plain_light: {
        background: theme.bgLight,
        padding: "20px"
      },
      plain_dark: {
        background: theme.bgDark,
        padding: "20px"
      }
    };

    var backgroundStyle = _extends({}, options.plain ? styles.plain : null, options.light ? styles.light : null, options.dark ? styles.dark : null, options.plain && options.light ? styles.plain_light : null, options.plain && options.dark ? styles.plain_dark : null);

    // Deconstruct srcset strings
    var imageSrcset = parse(src).map(function (img) {
      return _extends({}, img, { url: getPublicPath(img.url, catalog) });
    });
    var overlaySrcset = overlay ? parse(overlay).map(function (img) {
      return _extends({}, img, { url: getPublicPath(img.url, catalog) });
    }) : [];

    var fallbackSrc = imageSrcset[0].url;
    var fallbackOverlay = overlay ? overlaySrcset[0].url : undefined;

    return React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.container, "label:Image;", "label:Image;") },
      React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.imageContainer, backgroundStyle), "label:Image;", "label:Image;") },
        React.createElement("img", {
          className: /*#__PURE__*/ /*#__PURE__*/css(styles.image, "label:Image;", "label:Image;"),
          srcSet: stringify(imageSrcset),
          src: fallbackSrc
        }),
        overlay && React.createElement(
          "div",
          {
            className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.overlay, options.plain && !options.light && !options.dark ? { padding: 0 } : null), "label:Image;", "label:Image;")
          },
          React.createElement("img", {
            className: /*#__PURE__*/ /*#__PURE__*/css(styles.image, "label:Image;", "label:Image;"),
            srcSet: stringify(overlaySrcset),
            src: fallbackOverlay
          })
        )
      ),
      (title || description) && React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.meta, "label:Image;", "label:Image;") },
        title && React.createElement(
          "div",
          { className: /*#__PURE__*/ /*#__PURE__*/css(styles.title, "label:Image;", "label:Image;") },
          title
        ),
        description && React.createElement(
          "div",
          { className: /*#__PURE__*/ /*#__PURE__*/css(styles.description, "label:Image;", "label:Image;") },
          renderMarkdown({ text: description })
        )
      )
    );
  };

  return Image;
}(React.Component);

Image$1.propTypes = {
  catalog: catalogShape.isRequired,
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  overlay: PropTypes.string,
  description: PropTypes.string,
  plain: PropTypes.bool,
  light: PropTypes.bool,
  dark: PropTypes.bool,
  scale: PropTypes.bool,
  imageContainerStyle: PropTypes.object
};

var Image$2 = Specimen()(Image$1);

function getStyle$5(theme) {
  return {
    container: {
      flexBasis: "100%",
      overflow: "auto",
      paddingBottom: "10px"
    },
    table: {
      borderCollapse: "collapse",
      lineHeight: "auto",
      width: "100%",
      borderBottom: "none"
    },
    tableRow: {
      borderBottom: "1px solid " + theme.lightColor
    },
    head: {
      fontWeight: "bold",
      borderBottom: "2px solid " + theme.lightColor
    },
    cell: _extends({}, text(theme), {
      padding: "16px 16px  16px 0 ",
      textAlign: "left",
      verticalAlign: "top",
      ":last-child": { padding: "16px 0" },
      "& > :first-child": { marginTop: 0 },
      "& > :last-child": { marginBottom: 0 }
    })
  };
}

var Cell = function Cell(_ref) {
  var value = _ref.value,
      style = _ref.style;

  var content = void 0;
  if (typeof value === "string" || typeof value === "number") {
    content = renderMarkdown({ text: value.toString() });
  } else if (value === void 0) {
    content = React.createElement(
      "span",
      { className: /*#__PURE__*/ /*#__PURE__*/css({ opacity: 0.2 }, "label:Cell;", "label:Cell;") },
      "\u2014"
    );
  } else {
    content = value;
  }

  return React.createElement(
    "td",
    { className: /*#__PURE__*/ /*#__PURE__*/css(style, "label:Cell;", "label:Cell;") },
    content
  );
};

Cell.propTypes = {
  value: PropTypes.node,
  style: PropTypes.object.isRequired
};

var HeadingCell = function HeadingCell(_ref2) {
  var value = _ref2.value,
      style = _ref2.style;
  return React.createElement(
    "th",
    { className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, style, { fontWeight: "bold" }), "label:HeadingCell;", "label:HeadingCell;") },
    value
  );
};

HeadingCell.propTypes = Cell.propTypes;

var Table = function (_React$Component) {
  inherits(Table, _React$Component);

  function Table() {
    classCallCheck(this, Table);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Table.prototype.render = function render() {
    var _props = this.props,
        columns = _props.columns,
        rows = _props.rows,
        theme = _props.catalog.theme;

    var _getStyle = getStyle$5(theme),
        cell = _getStyle.cell,
        container = _getStyle.container,
        table = _getStyle.table,
        head$$1 = _getStyle.head,
        tableRow = _getStyle.tableRow;

    var tableKeys = columns ? columns : rows.reduce(function (index, row) {
      return index.concat(Object.keys(row));
    }, []).filter(function (value, i, self) {
      return self.indexOf(value) === i;
    });

    return React.createElement(
      "section",
      { className: /*#__PURE__*/ /*#__PURE__*/css(container, "label:Table;", "label:Table;") },
      React.createElement(
        "table",
        { className: /*#__PURE__*/ /*#__PURE__*/css(table, "label:Table;", "label:Table;") },
        React.createElement(
          "thead",
          { className: /*#__PURE__*/ /*#__PURE__*/css(head$$1, "label:Table;", "label:Table;") },
          React.createElement(
            "tr",
            null,
            tableKeys.map(function (key, k) {
              return React.createElement(HeadingCell, { value: key, key: k, style: cell });
            })
          )
        ),
        React.createElement(
          "tbody",
          null,
          rows.map(function (row, i) {
            return React.createElement(
              "tr",
              { className: /*#__PURE__*/ /*#__PURE__*/css(tableRow, "label:Table;", "label:Table;"), key: i },
              tableKeys.map(function (key, k) {
                return React.createElement(Cell, { value: row[key], key: k, style: cell });
              })
            );
          })
        )
      )
    );
  };

  return Table;
}(React.Component);

Table.propTypes = {
  catalog: catalogShape.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.string)
};

Table.defaultProps = {};
var Table$1 = Specimen(undefined, undefined, { withChildren: false })(Table);

function getStyle$6(theme) {
  return {
    container: {
      background: "#fff",
      width: "100%",
      textRendering: "initial",
      WebkitFontSmoothing: "initial",
      MozOsxFontSmoothing: "initial",
      display: "flex"
    },
    wrapper: {
      padding: "10px 20px",
      boxSizing: "border-box",
      width: "100%"
    },
    title: {
      fontFamily: theme.fontMono,
      opacity: 0.4,
      margin: "10px 0"
    },
    heading: {
      maxWidth: "100%",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden"
    },
    kerning: {
      textRendering: "optimizeLegibility"
    },
    smoothing: {
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale"
    },
    list: {
      listStyleType: "none",
      paddingLeft: 0,
      marginLeft: 0
    }
  };
}

var lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.   Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim.";
var kafka = "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. \"What's happened to me?\" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame. It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the dull weather.";

var Type$1 = function (_React$Component) {
  inherits(Type$$1, _React$Component);

  function Type$$1() {
    classCallCheck(this, Type$$1);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Type$$1.prototype.render = function render() {
    var _props = this.props,
        theme = _props.catalog.theme,
        options = objectWithoutProperties(_props, ["catalog"]);

    var styles = getStyle$6(theme);

    // check if a shorter paragraph should is demanded
    var truncate = options.shorter ? 100 : null;
    // check if alternate dummy text is set
    var dummyText = options.kafka ? kafka : lorem;
    // check if the modifier demands kerning
    var kerning = options.kern ? styles.kerning : null;
    // check if the modifier demands font smoothing
    var smoothing = options.smoothen ? styles.smoothing : null;
    // Use single word or sentence for headlines
    var headlineText = options.single ? "Hamburgefonstiv" : "The quick brown fox jumps over the lazy dog";

    var fontColor = options.color ? { color: options.color } : null;
    var isItalic = options.style ? options.style : "normal";
    var fontFamily = options.font ? options.font : "inherit";
    var backgroundColor = options.background ? { backgroundColor: options.background } : null;
    var fontWeight = options.weight ? options.weight : "normal";
    var letterSpacing = options.tracking ? { letterSpacing: options.tracking } : null;
    var backgroundImage = options.image ? {
      backgroundImage: "url(" + options.image + ")",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat"
    } : null;

    var description = React.createElement(
      "ul",
      { className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.title, styles.list, fontColor), "label:description;", "label:description;") },
      options.color ? React.createElement(
        "li",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.list, "label:description;", "label:description;") },
        "color: ",
        options.color + ";"
      ) : null,
      options.background ? React.createElement(
        "li",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.list, "label:description;", "label:description;") },
        "background-color: ",
        options.background + ";"
      ) : null,
      fontWeight !== "normal" ? React.createElement(
        "li",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.list, "label:description;", "label:description;") },
        "font-weight: ",
        options.weight + ";"
      ) : null,
      isItalic !== "normal" ? React.createElement(
        "li",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.list, "label:description;", "label:description;") },
        "font-style: ",
        options.style + ";"
      ) : null,
      letterSpacing ? React.createElement(
        "li",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.list, "label:description;", "label:description;") },
        "letter-spacing: ",
        options.tracking + ";"
      ) : null
    );

    var headings = options.headings ? options.headings.map(function (heading, i) {
      var headingValue = heading !== null && (typeof heading === "undefined" ? "undefined" : _typeof(heading)) === "object" ? heading.value : heading;
      var headingLabel = heading !== null && (typeof heading === "undefined" ? "undefined" : _typeof(heading)) === "object" ? heading.label : "h" + (i + 1);
      var isPixel = typeof headingValue === "number" ? "px" : "";
      return React.createElement(
        "div",
        { key: i },
        React.createElement(
          "div",
          { className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.title, fontColor), "label:headings;", "label:headings;") },
          headingLabel,
          " (",
          headingValue + isPixel,
          ")"
        ),
        React.createElement(
          "div",
          {
            className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.heading, letterSpacing, {
              font: isItalic + " normal " + fontWeight + " " + (headingValue + isPixel) + " " + fontFamily
            }), "label:headings;", "label:headings;")
          },
          headlineText
        )
      );
    }) : null;

    var paragraphs = options.paragraphs ? options.paragraphs.map(function (paragraph, i) {
      var paragraphValue = paragraph !== null && (typeof paragraph === "undefined" ? "undefined" : _typeof(paragraph)) === "object" ? paragraph.value : paragraph;
      var paragraphLabel = paragraph !== null && (typeof paragraph === "undefined" ? "undefined" : _typeof(paragraph)) === "object" ? paragraph.label : "Paragraph";

      var values = paragraphValue.split("/").map(function (item) {
        return (/[a-z]/i.test(item) ? "" + item : item + "px"
        );
      }).join("/");
      return React.createElement(
        "div",
        { key: i },
        React.createElement(
          "div",
          { className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.title, fontColor), "label:paragraphs;", "label:paragraphs;") },
          paragraphLabel,
          " (",
          values,
          ")"
        ),
        React.createElement(
          "div",
          {
            className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.paragraph, letterSpacing, {
              font: isItalic + " normal " + fontWeight + " " + values + " " + fontFamily
            }), "label:paragraphs;", "label:paragraphs;")
          },
          truncate ? dummyText.substring(0, 200) + "\u2026" : dummyText
        )
      );
    }) : null;

    return React.createElement(
      "section",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.container, "label:Type;", "label:Type;") },
      React.createElement(
        "div",
        {
          className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.wrapper, kerning, smoothing, fontColor, backgroundColor, backgroundImage), "label:Type;", "label:Type;")
        },
        headings,
        headings && paragraphs ? React.createElement("br", null) : null,
        paragraphs,
        description
      )
    );
  };

  return Type$$1;
}(React.Component);

Type$1.propTypes = {
  shorter: PropTypes.bool,
  kafka: PropTypes.bool,
  kern: PropTypes.bool,
  smoothen: PropTypes.bool,
  single: PropTypes.bool,
  color: PropTypes.string,
  style: PropTypes.string,
  font: PropTypes.string,
  background: PropTypes.string,
  weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tracking: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  image: PropTypes.string,
  headings: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })])),
  paragraphs: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })])),
  catalog: catalogShape.isRequired
};

var Type$2 = Specimen()(Type$1);

var DownloadIcon = function DownloadIcon(_ref // eslint-disable-line
) {
  var styles = _ref.styles,
      fill = _ref.fill;
  return React.createElement(
    "svg",
    { className: /*#__PURE__*/ /*#__PURE__*/css(styles.img, "label:DownloadIcon;", "label:DownloadIcon;"), viewBox: "0 0 120 120" },
    React.createElement(
      "g",
      { fill: "none", fillRule: "evenodd" },
      React.createElement("rect", { width: "120", height: "120", fill: "#EEEEEE", rx: "2" }),
      React.createElement(
        "g",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.icon, "label:DownloadIcon;", "label:DownloadIcon;") },
        React.createElement("path", { d: "M72.647 53.353c-.468-.47-1.226-.47-1.697 0L61 63.303V36.2c0-.662-.538-1.2-1.2-1.2-.662 0-1.2.538-1.2 1.2v27.103l-9.95-9.95c-.47-.47-1.23-.47-1.7 0-.468.468-.468 1.226 0 1.697l12 12c.236.232.543.35.85.35.307 0 .614-.118.85-.353l12-12c.468-.468.468-1.226-.003-1.694z" }),
        React.createElement("path", { d: "M79 75.8H40.6c-1.985 0-3.6-1.615-3.6-3.6v-4.8c0-.662.538-1.2 1.2-1.2.662 0 1.2.538 1.2 1.2v4.8c0 .662.538 1.2 1.2 1.2H79c.662 0 1.2-.538 1.2-1.2v-4.8c0-.662.538-1.2 1.2-1.2.662 0 1.2.538 1.2 1.2v4.8c0 1.985-1.615 3.6-3.6 3.6z" })
      )
    )
  );
};

function getStyle$7(theme) {
  var baseLinkStyle = {
    color: theme.brandColor,
    transition: "none",
    border: "none",
    background: "none",
    textDecoration: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "row"
  };
  return {
    container: {
      width: "100%",
      boxSizing: "content-box",
      height: 80,
      background: "#fff",
      border: "1px solid #eee",
      transition: ".4s background"
    },
    a: _extends({}, baseLinkStyle, {
      "&:hover, &:focus, &:active": _extends({}, baseLinkStyle, {
        color: theme.linkColor,
        "& div": {
          color: theme.linkColor
        }
      })
    }),
    img: {
      width: 80,
      height: 80,
      display: "none",
      flexShrink: 0,
      "@media (min-width: 630px)": {
        display: "block"
      }
    },
    icon: {
      fill: "currentColor"
    },
    titleblock: {
      fontFamily: theme.fontFamily,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      flexGrow: 1,
      lineHeight: 1.33333,
      padding: "12px 0 12px 16px",
      textRendering: "optimizeLegibility",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale"
    },
    title: {
      // color: theme.brandColor,
      fontSize: getFontSize(theme, -1),
      fontWeight: 700,
      margin: 0
    },
    subtitle: {
      fontSize: getFontSize(theme, -1),
      color: "#999",
      margin: 0
    }
  };
}

var DownloadSpecimen = function (_React$Component) {
  inherits(DownloadSpecimen, _React$Component);

  function DownloadSpecimen() {
    classCallCheck(this, DownloadSpecimen);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  DownloadSpecimen.prototype.render = function render() {
    var _props = this.props,
        catalog = _props.catalog,
        theme = _props.catalog.theme,
        title = _props.title,
        subtitle = _props.subtitle,
        url = _props.url,
        filename = _props.filename;

    var styles = getStyle$7(theme);

    var image = this.props.span !== 1 ? React.createElement(DownloadIcon, { styles: styles }) : null;

    return React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.container, "label:DownloadSpecimen;", "label:DownloadSpecimen;") },
      React.createElement(
        "a",
        {
          className: /*#__PURE__*/ /*#__PURE__*/css(styles.a, "label:DownloadSpecimen;", "label:DownloadSpecimen;"),
          href: getPublicPath(url, catalog),
          download: filename
        },
        image,
        React.createElement(
          "div",
          { className: /*#__PURE__*/ /*#__PURE__*/css(styles.titleblock, "label:DownloadSpecimen;", "label:DownloadSpecimen;") },
          React.createElement(
            "div",
            { className: /*#__PURE__*/ /*#__PURE__*/css(styles.title, "label:DownloadSpecimen;", "label:DownloadSpecimen;") },
            title
          ),
          React.createElement(
            "div",
            { className: /*#__PURE__*/ /*#__PURE__*/css(styles.subtitle, "label:DownloadSpecimen;", "label:DownloadSpecimen;") },
            subtitle
          )
        )
      )
    );
  };

  return DownloadSpecimen;
}(React.Component);

DownloadSpecimen.defaultProps = {
  title: "",
  subtitle: "",
  theme: {}
};

DownloadSpecimen.propTypes = {
  catalog: catalogShape.isRequired,
  span: PropTypes.number,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  url: PropTypes.string.isRequired,
  filename: PropTypes.string
};

var Download = Specimen()(DownloadSpecimen);

var Video = function (_React$Component) {
  inherits(Video, _React$Component);

  function Video() {
    classCallCheck(this, Video);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Video.prototype.render = function render() {
    var _props = this.props,
        src = _props.src,
        title = _props.title,
        muted = _props.muted,
        loop = _props.loop,
        autoplay = _props.autoplay,
        catalog = _props.catalog,
        theme = _props.catalog.theme;

    var parsedSrc = getPublicPath(src, catalog);
    var styles = {
      section: {
        display: "flex",
        flexFlow: "row wrap",
        width: "100%"
      },
      container: {
        boxSizing: "border-box",
        margin: "0 10px 10px 0",
        padding: 0,
        position: "relative"
      },
      title: _extends({}, heading(theme, 1), {
        margin: 0
      })
    };

    return React.createElement(
      "section",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.section, "label:Video;", "label:Video;") },
      React.createElement(
        "video",
        {
          src: parsedSrc,
          autoPlay: autoplay,
          loop: loop,
          muted: muted,
          controls: true,
          className: /*#__PURE__*/ /*#__PURE__*/css({ width: "100%", height: "100%" }, "label:Video;", "label:Video;")
        },
        "Open",
        " ",
        React.createElement(
          "a",
          { href: parsedSrc, target: "_blank" },
          "video"
        ),
        " ",
        "in a new Tab"
      ),
      title && React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.title, "label:Video;", "label:Video;") },
        title
      )
    );
  };

  return Video;
}(React.Component);

Video.propTypes = {
  catalog: catalogShape.isRequired,
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  muted: PropTypes.bool,
  loop: PropTypes.bool,
  autoplay: PropTypes.bool
};

var Video$1 = Specimen()(Video);

/*

Turns a React element into its JSX string representation.

Probably not complete

Features:

- Uses self-closing tags when no children are set
- Uses a single line for one/none prop
- Uses multiple lines for multiple props
- Sorts props alphabetically
- Removes defaultProps from output

Needs work:

- Don't use JSON.stringify: Nested objects are rendered as JSON (e.g. <div style={{"foo":"bar"}} />)

*/

var reactElementToString = function reactElementToString(el) {
  var indent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

  if (el === void 0) {
    return "";
  }

  if (typeof el === "string") {
    return "" + indent + el;
  }

  var props = el.props,
      type = el.type;

  var displayName = "";
  var defaultProps = null;

  if (typeof type === "string") {
    displayName = type;
  } else {
    displayName = type.displayName || type.name;
    defaultProps = type.defaultProps;
  }

  var formatProp = function formatProp(k, v) {
    if (v === true) {
      return k;
    }
    if (typeof v === "string") {
      return k + "='" + v + "'";
    }
    if (React.isValidElement(v)) {
      return k + "={" + reactElementToString(v) + "}";
    }
    return k + "={" + (JSON.stringify(v) || v.name || (typeof v === "undefined" ? "undefined" : _typeof(v))) + "}";
  };

  var propKeys = Object.keys(props).sort().filter(function (k) {
    return k !== "children";
  }).filter(function (k) {
    return props[k] !== undefined;
  }).filter(function (k) {
    return defaultProps ? props[k] !== defaultProps[k] : true;
  });

  var propString = "";
  try {
    propString = propKeys.map(function (k) {
      return formatProp(k, props[k]);
    }).join("\n" + indent + "  ");
  } catch (e) {
    return "Couldn't stringify React Element. Try setting `sourceText` explicitly or use `noSource`.\n\n" + e;
  }

  var whitespaceBeforeProps = propKeys.length > 1 // eslint-disable-line no-nested-ternary
  ? "\n" + indent + "  " : propKeys.length === 1 ? " " : "";
  var whitespaceAfterProps = propKeys.length > 1 ? "\n" + indent : "";

  return props.children ? indent + "<" + displayName + whitespaceBeforeProps + propString + whitespaceAfterProps + ">\n" + React.Children.map(props.children, function (c) {
    return reactElementToString(c, indent + "  ");
  }).join("\n") + "\n" + indent + "</" + displayName + ">" : indent + "<" + displayName + whitespaceBeforeProps + propString + whitespaceAfterProps + " />";
};

// A little helper to require babel-transformed modules with default export
var requireModuleDefault = (function (module) {
  return module.__esModule ? module.default : module;
});

var presets = ["es2015-loose", "react", "stage-2"];

// Babel plugin to return last top-level expression statement
var returnLastExpressionPlugin = function returnLastExpressionPlugin(_ref) {
  var t = _ref.types;
  return {
    visitor: {
      // We only care about top-level expressions
      Program: function Program(path) {
        // Find the last expression statement
        var lastExpr = void 0;
        for (var i = path.node.body.length - 1; i >= 0; i--) {
          if (t.isExpressionStatement(path.node.body[i])) {
            lastExpr = path.get("body." + i);
            break;
          }
        }

        if (lastExpr) {
          // ... and turn it into a return statement
          lastExpr.replaceWith(t.returnStatement(lastExpr.node.expression));
        }
      }
    }
  };
};

var cached = {};
var cachedTransform = function cachedTransform(jsx) {
  if (cached[jsx]) {
    return cached[jsx];
  }
  var transformed = transform(jsx, {
    compact: true,
    presets: presets,
    plugins: [returnLastExpressionPlugin]
  }).code;
  cached[jsx] = transformed;
  return transformed;
};

var missingTransformError = {
  error: "Please include [babel-standalone](https://github.com/babel/babel-standalone) before Catalog."
};

var transformJSX = (function (jsx, imports) {
  // Check for transform to provide a better error message
  try {
  } catch (error) {
    return missingTransformError;
  }

  try {
    var importKeys = Object.keys(imports).filter(function (k) {
      return imports[k];
    });
    var importModules = importKeys.map(function (k) {
      return requireModuleDefault(imports[k]);
    });
    var code = cachedTransform(jsx);
    // eslint-disable-next-line no-new-func
    var element = new (Function.prototype.bind.apply(Function, [null].concat(["React"], importKeys, [code])))().apply(undefined, [React].concat(importModules));
    return { code: code, element: element };
  } catch (error) {
    return { error: error };
  }
});

var PADDING$1 = 3;
var SIZE$1 = 20;

function getStyle$8(theme) {
  return {
    container: {
      background: "#fff",
      border: "1px solid #eee",
      boxSizing: "border-box",
      position: "relative",
      width: "100%",
      display: "flex",
      flexDirection: "column"
    },
    toggle: {
      border: PADDING$1 + "px solid transparent",
      color: theme.lightColor,
      cursor: "pointer",
      display: "inline-block",
      fontFamily: theme.fontMono,
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 700,
      height: SIZE$1 + "px",
      lineHeight: SIZE$1 + "px",
      padding: PADDING$1 + "px",
      position: "absolute",
      right: -PADDING$1 + "px",
      top: -(SIZE$1 + 2 * PADDING$1) + "px",
      userSelect: "none",
      ":hover": {
        color: theme.textColor
      }
    },
    source: {
      borderTop: "1px solid #eee",
      boxSizing: "border-box",
      width: "100%",
      height: "auto"
    },
    content: {
      background: "url(" + theme.checkerboardPatternLight + ")",
      border: "none",
      borderRadius: "2px",
      boxSizing: "border-box",
      display: "block",
      padding: 20,
      position: "relative",
      width: "100%",
      height: "100%"
    },
    light: {
      background: "url(" + theme.checkerboardPatternLight + ")"
    },
    dark: {
      background: "url(" + theme.checkerboardPatternDark + ")"
    },
    plain: {
      background: "transparent",
      padding: "0"
    },
    plain_light: {
      background: theme.bgLight,
      padding: "20px"
    },
    plain_dark: {
      background: theme.bgDark,
      padding: "20px"
    },
    responsive: {
      boxSizing: "border-box",
      overflow: "hidden",
      padding: "15px",
      textAlign: "center"
    }
  };
}

var ReactSpecimen = function (_Component) {
  inherits(ReactSpecimen, _Component);

  function ReactSpecimen(props) {
    classCallCheck(this, ReactSpecimen);

    var _this = possibleConstructorReturn(this, _Component.call(this, props));

    _this.state = {
      viewSource: !!props.showSource,
      elementState: props.state,
      parentWidth: null,
      activeScreenSize: validateSizes(props.responsive, props.catalog.responsiveSizes)[0] || null
    };
    _this.setElementState = _this.setElementState.bind(_this);
    _this.setSize = _this.setSize.bind(_this);
    _this.updateParentWidth = _this.updateParentWidth.bind(_this);
    return _this;
  }

  ReactSpecimen.prototype.componentDidMount = function componentDidMount() {
    if (this.state.activeScreenSize) {
      window.addEventListener("resize", this.updateParentWidth);
      setTimeout(this.updateParentWidth);
    }
  };

  ReactSpecimen.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.state.activeScreenSize) {
      window.removeEventListener("resize", this.updateParentWidth);
    }
  };

  ReactSpecimen.prototype.setElementState = function setElementState(nextState) {
    if (typeof nextState === "function") {
      this.setState(function (_ref) {
        var elementState = _ref.elementState;
        return {
          elementState: _extends({}, elementState, nextState(elementState))
        };
      });
    } else {
      this.setState({
        elementState: _extends({}, this.state.elementState, nextState)
      });
    }
  };

  ReactSpecimen.prototype.updateParentWidth = function updateParentWidth() {
    if (!this.specimen) {
      return;
    }
    var nextParentWidth = this.specimen.getBoundingClientRect().width - 30;
    if (nextParentWidth !== this.state.parentWidth) {
      this.setState({ parentWidth: nextParentWidth });
    }
  };

  ReactSpecimen.prototype.setSize = function setSize(activeScreenSize) {
    this.setState({ activeScreenSize: activeScreenSize });
  };

  ReactSpecimen.prototype.toggleSource = function toggleSource() {
    this.setState(function (_ref2) {
      var viewSource = _ref2.viewSource;
      return { viewSource: !viewSource };
    });
  };

  ReactSpecimen.prototype.render = function render() {
    var _this2 = this;

    var _props = this.props,
        _props$catalog = _props.catalog,
        imports = _props$catalog.page.imports,
        theme = _props$catalog.theme,
        responsiveSizes = _props$catalog.responsiveSizes,
        children = _props.children,
        frame = _props.frame,
        sourceText = _props.sourceText,
        options = objectWithoutProperties(_props, ["catalog", "children", "frame", "sourceText"]);
    var _state = this.state,
        activeScreenSize = _state.activeScreenSize,
        parentWidth = _state.parentWidth,
        viewSource = _state.viewSource;

    var styles = getStyle$8(theme);
    var validSizes = validateSizes(options.responsive, responsiveSizes);

    var exampleStyles = _extends({}, options.plain ? styles.plain : null, options.light ? styles.light : null, options.dark ? styles.dark : null, options.plain && options.light ? styles.plain_light : null, options.plain && options.dark ? styles.plain_dark : null, options.responsive ? styles.responsive : null);

    var frameBackground = options.responsive ? exampleStyles.background || styles.content.background : undefined;
    var exampleBackground = options.responsive ? "white" : exampleStyles.background || styles.content.background;

    var jsx$$1 = typeof children === "string";
    var element = null;
    var error = null;
    var code = "";

    if (jsx$$1) {
      var transformed = transformJSX(children, _extends({}, imports, {
        state: this.state.elementState,
        setState: this.setElementState
      }));
      element = transformed.element;
      error = transformed.error ? React.createElement(
        Hint$1,
        { warning: true },
        "Couldn't render specimen: " + transformed.error
      ) : null;
      code = children;
    } else {
      element = children;
      if (!options.noSource) {
        code = sourceText || reactElementToString(children);
      }
    }

    if (options.responsive && !validSizes) {
      return React.createElement(
        Hint$1,
        { warning: true },
        "Please check that the responsive parameters match an existing entry."
      );
    }

    if (error) return error;

    var source = viewSource ? React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.source, "label:source;", "label:source;") },
      React.createElement(HighlightedCode, { language: "jsx", code: code, theme: theme })
    ) : null;

    var toggle = !options.noSource ? React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.toggle, "label:toggle;", "label:toggle;"), onClick: function onClick() {
          return _this2.toggleSource();
        } },
      "<>"
    ) : null;

    return React.createElement(
      "section",
      {
        className: /*#__PURE__*/ /*#__PURE__*/css(styles.container, "label:ReactSpecimen;", "label:ReactSpecimen;"),
        ref: function ref(el) {
          _this2.specimen = el;
        }
      },
      toggle,
      options.responsive && parentWidth && activeScreenSize && React.createElement(ResponsiveTabs, {
        theme: theme,
        sizes: validSizes,
        action: this.setSize,
        activeSize: activeScreenSize,
        parentWidth: parentWidth
      }),
      (!options.responsive || parentWidth) && React.createElement(
        "div",
        {
          className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.content, exampleStyles, {
            background: exampleBackground
          }), "label:ReactSpecimen;", "label:ReactSpecimen;")
        },
        frame || activeScreenSize ? React.createElement(
          Frame,
          {
            width: activeScreenSize && activeScreenSize.width,
            parentWidth: parentWidth ? parentWidth : "100%",
            height: activeScreenSize && activeScreenSize.height,
            scrolling: frame ? false : true,
            background: frameBackground
          },
          element
        ) : element
      ),
      source
    );
  };

  return ReactSpecimen;
}(Component);

ReactSpecimen.propTypes = {
  catalog: catalogShape.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
  responsive: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  noSource: PropTypes.bool,
  showSource: PropTypes.bool,
  plain: PropTypes.bool,
  light: PropTypes.bool,
  dark: PropTypes.bool,
  frame: PropTypes.bool,
  state: PropTypes.object,
  sourceText: PropTypes.string
};

var ReactSpecimen$1 = Specimen(undefined, undefined, { withChildren: true })(ReactSpecimen);

var specimens = {
  "raw-code": RawCode,
  audio: Audio$1,
  code: Code$1,
  color: Color$1,
  "color-palette": ColorPalette$1,
  html: Html$1,
  hint: Hint$1,
  image: Image$2,
  table: Table$1,
  type: Type$2,
  download: Download,
  video: Video$1,
  react: ReactSpecimen$1
};

var getType = compose(toLower, head, split("|"));

var parseSpecimenType = function parseSpecimenType() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  return or(getType(options), "raw-code");
};

// eslint-disable-next-line react/display-name
var getUnknownSpecimen = function getUnknownSpecimen(specimenType) {
  return function () {
    return React.createElement(
      Hint$1,
      { warning: true },
      "Unknown Specimen: **" + specimenType + "**"
    );
  };
};

var MarkdownSpecimen = function (_Component) {
  inherits(MarkdownSpecimen, _Component);

  function MarkdownSpecimen() {
    classCallCheck(this, MarkdownSpecimen);
    return possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  MarkdownSpecimen.prototype.render = function render() {
    var _props = this.props,
        options = _props.options,
        body = _props.body,
        getSpecimen = _props.getSpecimen;

    var specimenType = parseSpecimenType(options);
    var Specimen = getSpecimen(specimenType) || getUnknownSpecimen(specimenType);

    return React.createElement(Specimen, { rawOptions: options, rawBody: body });
  };

  return MarkdownSpecimen;
}(Component);


MarkdownSpecimen.propTypes = {
  body: PropTypes.string.isRequired,
  options: PropTypes.string.isRequired,
  getSpecimen: PropTypes.func.isRequired
};

var pageStyle = {
  boxSizing: "border-box",
  margin: "0 20px 0 20px",
  maxWidth: "64em",
  display: "flex",
  flexFlow: "row wrap",
  padding: "48px 0",
  "@media (min-width: 640px)": {
    margin: "0 10px 0 20px"
  },
  "@media (min-width: 1000px)": {
    margin: "0 30px 0 40px"
  },
  "& > :first-child": {
    marginTop: 0
  }
};

var Page = function (_Component) {
  inherits(Page, _Component);

  function Page() {
    classCallCheck(this, Page);
    return possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  Page.prototype.render = function render() {
    var children = this.props.children;
    var getSpecimen = this.context.catalog.getSpecimen;


    var getSpecimenKey = seqKey("Specimen");

    return React.createElement(
      "div",
      {
        className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, pageStyle), "label:Page;", "label:Page;")
      },
      React.Children.map(children, function (child) {
        var md = typeof child === "string" ? renderMarkdown({
          text: child,
          renderer: {
            code: function code(body, options) {
              return React.createElement(MarkdownSpecimen, {
                key: getSpecimenKey(),
                body: body,
                options: options || "",
                getSpecimen: getSpecimen
              });
            }
          }
        }) : child;
        return md;
      })
    );
  };

  return Page;
}(Component);

Page.propTypes = {
  children: PropTypes.node
};

Page.contextTypes = {
  catalog: catalogShape.isRequired
};

var NotFound = function NotFound(_ref) {
  var location = _ref.location;
  return React.createElement(
    Page,
    null,
    "Sorry, no page exists at **" + location.pathname + "**."
  );
};

NotFound.propTypes = {
  location: PropTypes.object.isRequired
};

var has = function has(key) {
  return function (o) {
    return o.hasOwnProperty(key);
  };
};
var hasName = has("name");
var hasTitle = has("title");
var hasSrc = has("src");
var hasPages = has("pages");
var hasComponent = has("component");
var hasContent = has("content");
var hasEither = function hasEither() {
  for (var _len = arguments.length, matchers = Array(_len), _key = 0; _key < _len; _key++) {
    matchers[_key] = arguments[_key];
  }

  return function (o) {
    var matchCount = matchers.reduce(function (count, match) {
      return count + (match(o) ? 1 : 0);
    }, 0);
    return matchCount === 1;
  };
};

var flattenPageTree = function flattenPageTree(pageTree) {
  return pageTree.reduce(function (pages, page) {
    return pages.concat(page.pages ? [page].concat(page.pages) : [page]);
  }, []).filter(function (page) {
    return page.src || page.component;
  }).map(function (page, index) {
    return _extends({}, page, page.hideFromMenu ? undefined : { index: index });
  });
};

var getPublicUrl = function getPublicUrl() {
  return typeof process !== "undefined" && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "/";
};

var configure = (function (config) {
  var pageId = 0;
  var publicUrl = stripTrailingSlashes(config.publicUrl || getPublicUrl());
  var basePath = config.useBrowserHistory ? addLeadingSlash(stripTrailingSlashes(config.basePath || parse$1(publicUrl).pathname || "")) : addLeadingSlash(stripTrailingSlashes(config.basePath || ""));

  var pageReducer = function pageReducer(pages, page) {
    var configStyles = config.styles || [];
    var pageStyles = page.styles || [];
    var configScripts = config.scripts || [];
    var pageScripts = page.scripts || [];

    warning$1(!hasName(page), "The page configuration property `name` is deprecated; use `path` instead.", page);

    warning$1(hasTitle(page), "The page configuration property `title` is missing.", page);

    warning$1(!hasSrc(page) || typeof page.src === "string", "The page configuration property `src` must be a string.", page);

    warning$1(!hasComponent(page) || typeof requireModuleDefault(page.component) === "function", "The page configuration property `component` must be a React component.", page);

    warning$1(!hasContent(page) || typeof requireModuleDefault(page.content) === "function", "The page configuration property `content` must be a React component.", page);

    warning$1(hasEither(hasSrc, hasComponent, hasPages, hasContent)(page), "The page configuration should (only) have one of these properties: `src`, `component`, `content` or `pages`.", page);

    return [].concat(pages, [_extends({}, page, {
      id: ++pageId
    }, page.content ? { component: page.content, content: undefined } : undefined, {
      // Currently, catalog can't be nested inside other page routes, it messes up <Link> matching. Use `basePath`
      path: page.pages ? null : parsePath(page.path || page.name, { basePath: basePath }).pathname,
      pages: page.pages ? page.pages.reduce(pageReducer, []).map(function (p) {
        return _extends({}, p, { superTitle: page.title });
      }) : null,
      styles: Array.from(new Set([].concat(configStyles, pageStyles))),
      scripts: Array.from(new Set([].concat(configScripts, pageScripts))),
      imports: _extends({}, config.imports, page.imports)
    })]);
  };

  var pageTree = config.pages.reduce(pageReducer, []).map(function (p) {
    return _extends({}, p, { superTitle: config.title });
  }).concat({
    path: parsePath("/*", { basePath: basePath }).pathname,
    id: ++pageId,
    component: NotFound,
    title: "Page Not Found",
    superTitle: config.title,
    scripts: [],
    styles: [],
    imports: {},
    hideFromMenu: true
  });
  var pages = flattenPageTree(pageTree);

  return _extends({}, config, {
    // Used to check in configureRoutes() if input is already configured
    __catalogConfig: true,
    theme: _extends({}, DefaultTheme, config.theme),
    responsiveSizes: config.responsiveSizes || DefaultResponsiveSizes,
    specimens: _extends({}, specimens, config.specimens),
    basePath: basePath,
    publicUrl: publicUrl,
    pages: pages,
    pageTree: pageTree
  });
});

// The vertical and horizontal padding inside the left/right nav
// link element.
var verticalPadding = 28;
var horizontalPadding = 21;

function getStyles(theme) {
  var baseLinkStyle = {
    color: theme.navBarTextColor,
    display: "block",
    fontFamily: theme.fontFamily,
    textDecoration: "none",
    border: "none",
    background: "none",
    transition: "none"
  };
  return {
    navbar: {
      width: "100%",
      backgroundColor: theme.navBarBackground
    },
    navlink: {
      boxSizing: "border-box",
      display: "inline-block",
      verticalAlign: "top",
      width: "50%",
      transition: ".2s opacity",
      "&:hover, &:focus, &:focus-within": {
        opacity: 0.65
      }
    },
    leftNavLink: {
      padding: verticalPadding + "px 0 " + verticalPadding + "px " + horizontalPadding + "px",
      textAlign: "left",
      "@media (min-width: 1000px)": {
        padding: verticalPadding + "px 0 " + verticalPadding + "px " + horizontalPadding * 2 + "px"
      }
    },
    rightNavLink: {
      padding: verticalPadding + "px " + horizontalPadding + "px " + verticalPadding + "px 0",
      textAlign: "right",
      "@media (min-width: 1000px)": {
        padding: verticalPadding + "px " + horizontalPadding * 2 + "px " + verticalPadding + "px 0"
      }
    },
    link: _extends({}, baseLinkStyle, {
      "&:hover, &:focus, &:active, &:visited": baseLinkStyle
    }),
    leftLinkIcon: {
      display: "none",
      margin: "0 24px 0 0",
      verticalAlign: "middle",
      "@media (min-width: 1000px)": {
        display: "inline"
      }
    },
    rightLinkIcon: {
      display: "none",
      margin: "0 0 0 24px",
      verticalAlign: "middle",
      "@media (min-width: 1000px)": {
        display: "inline"
      }
    },
    linkIconPath: {
      stroke: "none",
      fill: theme.navBarTextColor
    },
    linklabels: {
      display: "block",
      verticalAlign: "middle",
      "@media (min-width: 1000px)": {
        display: "inline-block"
      }
    },
    linkSuperTitle: {
      fontSize: getFontSize(theme, 0),
      margin: 0,
      fontWeight: 400
    },
    linkTitle: {
      fontSize: getFontSize(theme, 1),
      margin: 0,
      fontWeight: 400
    }
  };
}

var NavigationBar = function (_React$Component) {
  inherits(NavigationBar, _React$Component);

  function NavigationBar() {
    classCallCheck(this, NavigationBar);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  NavigationBar.prototype.render = function render() {
    var _props = this.props,
        nextPage = _props.nextPage,
        previousPage = _props.previousPage,
        theme = _props.theme;


    var styles = getStyles(theme);

    var leftIcon = React.createElement(
      "svg",
      {
        className: /*#__PURE__*/ /*#__PURE__*/css(styles.leftLinkIcon, "label:leftIcon;", "label:leftIcon;"),
        width: "37px",
        height: "26px",
        viewBox: "0 0 37 26"
      },
      React.createElement("path", {
        className: /*#__PURE__*/ /*#__PURE__*/css(styles.linkIconPath, "label:leftIcon;", "label:leftIcon;"),
        d: "M12.2925,0.2925 C12.6845,-0.0975 13.3165,-0.0975 13.7085,0.2925 C14.0985,0.6845 14.0985,1.3165 13.7085,1.7085 L3.4145,12.0005 L36.0005,12.0005 C36.5525,12.0005 37.0005,12.4485 37.0005,13.0005 C37.0005,13.5525 36.5525,14.0005 36.0005,14.0005 L3.4145,14.0005 L13.7085,24.2925 C14.0985,24.6845 14.0985,25.3165 13.7085,25.7085 C13.5125,25.9025 13.2565,26.0005 13.0005,26.0005 C12.7445,26.0005 12.4885,25.9025 12.2925,25.7085 L0.2925,13.7085 C-0.0975,13.3165 -0.0975,12.6845 0.2925,12.2925 L12.2925,0.2925 Z"
      })
    );
    var rightIcon = React.createElement(
      "svg",
      {
        className: /*#__PURE__*/ /*#__PURE__*/css(styles.rightLinkIcon, "label:rightIcon;", "label:rightIcon;"),
        width: "37px",
        height: "26px",
        viewBox: "0 0 37 26"
      },
      React.createElement("path", {
        className: /*#__PURE__*/ /*#__PURE__*/css(styles.linkIconPath, "label:rightIcon;", "label:rightIcon;"),
        d: "M24.708,0.2925 C24.316,-0.0975 23.684,-0.0975 23.292,0.2925 C22.902,0.6845 22.902,1.3165 23.292,1.7085 L33.586,12.0005 L1,12.0005 C0.448,12.0005 0,12.4485 0,13.0005 C0,13.5525 0.448,14.0005 1,14.0005 L33.586,14.0005 L23.292,24.2925 C22.902,24.6845 22.902,25.3165 23.292,25.7085 C23.488,25.9025 23.744,26.0005 24,26.0005 C24.256,26.0005 24.512,25.9025 24.708,25.7085 L36.708,13.7085 C37.098,13.3165 37.098,12.6845 36.708,12.2925 L24.708,0.2925 Z"
      })
    );

    return React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.navbar, "label:NavigationBar;", "label:NavigationBar;") },
      React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.navlink, "label:NavigationBar;", "label:NavigationBar;"), key: "left" },
        previousPage && React.createElement(
          Link$1,
          {
            to: previousPage.path,
            className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.link, styles.leftNavLink), "label:NavigationBar;", "label:NavigationBar;")
          },
          leftIcon,
          React.createElement(
            "div",
            { className: /*#__PURE__*/ /*#__PURE__*/css(styles.linklabels, "label:NavigationBar;", "label:NavigationBar;") },
            React.createElement(
              "div",
              { className: /*#__PURE__*/ /*#__PURE__*/css(styles.linkSuperTitle, "label:NavigationBar;", "label:NavigationBar;") },
              previousPage.superTitle
            ),
            React.createElement(
              "div",
              { className: /*#__PURE__*/ /*#__PURE__*/css(styles.linkTitle, "label:NavigationBar;", "label:NavigationBar;") },
              previousPage.title
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.navlink, "label:NavigationBar;", "label:NavigationBar;"), key: "right" },
        nextPage && React.createElement(
          Link$1,
          {
            to: nextPage.path,
            className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, styles.link, styles.rightNavLink), "label:NavigationBar;", "label:NavigationBar;")
          },
          React.createElement(
            "div",
            { className: /*#__PURE__*/ /*#__PURE__*/css(styles.linklabels, "label:NavigationBar;", "label:NavigationBar;") },
            React.createElement(
              "div",
              { className: /*#__PURE__*/ /*#__PURE__*/css(styles.linkSuperTitle, "label:NavigationBar;", "label:NavigationBar;") },
              nextPage.superTitle
            ),
            React.createElement(
              "div",
              { className: /*#__PURE__*/ /*#__PURE__*/css(styles.linkTitle, "label:NavigationBar;", "label:NavigationBar;") },
              nextPage.title
            )
          ),
          rightIcon
        )
      )
    );
  };

  return NavigationBar;
}(React.Component);

NavigationBar.propTypes = {
  theme: PropTypes.object.isRequired,
  nextPage: pageShape,
  previousPage: pageShape
};

var PageHeader = function (_Component) {
  inherits(PageHeader, _Component);

  function PageHeader() {
    classCallCheck(this, PageHeader);
    return possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  PageHeader.prototype.render = function render() {
    var _props = this.props,
        theme = _props.theme,
        title = _props.title,
        superTitle = _props.superTitle;


    var styles = {
      outerHeader: {
        boxSizing: "border-box",
        position: "relative",
        height: theme.pageHeadingHeight,
        background: theme.pageHeadingBackground
      },
      innerHeader: {
        position: "absolute",
        bottom: 21,
        left: 21,
        "@media (min-width: 1000px)": {
          left: 42
        }
      },
      superTitle: _extends({}, heading(theme, 1), {
        color: theme.pageHeadingTextColor,
        opacity: 0.6,
        margin: 0
      }),
      title: _extends({}, heading(theme, 4), {
        color: theme.pageHeadingTextColor,
        margin: 0
      })
    };

    return React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.outerHeader, "label:PageHeader;", "label:PageHeader;") },
      React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.innerHeader, "label:PageHeader;", "label:PageHeader;") },
        React.createElement(
          "h2",
          { className: /*#__PURE__*/ /*#__PURE__*/css(styles.superTitle, "label:PageHeader;", "label:PageHeader;") },
          superTitle
        ),
        React.createElement(
          "h1",
          { className: /*#__PURE__*/ /*#__PURE__*/css(styles.title, "label:PageHeader;", "label:PageHeader;") },
          title
        )
      )
    );
  };

  return PageHeader;
}(Component);

PageHeader.propTypes = {
  theme: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  superTitle: PropTypes.string.isRequired
};

var SIDEBAR_WIDTH = 251;
var SIDEBAR_ANIMATION_DURATION = 0.25;

injectGlobal("@import url(https://fonts.googleapis.com/css?family=Roboto:400,700,400italic);@import url(https://fonts.googleapis.com/css?family=Roboto+Mono:400,700);body{margin:0;padding:0;}");

var MenuIcon = function MenuIcon(props) {
  return React.createElement(
    "svg",
    _extends({}, props, { width: "27px", height: "20px", viewBox: "0 0 27 20" }),
    React.createElement(
      "g",
      { fill: "currentColor" },
      React.createElement("rect", { x: "0", y: "16", width: "26", height: "4" }),
      React.createElement("rect", { x: "0", y: "8", width: "26", height: "4" }),
      React.createElement("rect", { x: "0", y: "0", width: "26", height: "4" })
    )
  );
};

var getStyles$1 = function getStyles(theme, sidebarVisible) {
  return {
    container: {
      margin: 0,
      padding: 0,
      width: "100%",
      height: "100%",
      position: "relative",
      // Use display: flex, so flexbox children aren't affected by IE's min-height bug
      // See https://github.com/philipwalton/flexbugs#3-min-height-on-a-flex-container-wont-apply-to-its-flex-items
      display: "flex"
    },
    menuIcon: {
      color: theme.pageHeadingTextColor,
      cursor: "pointer",
      height: 30,
      left: 20,
      position: "absolute",
      top: 20,
      width: 30
    },
    sideNav: {
      background: theme.sidebarColor,
      boxSizing: "content-box",
      color: "#fff",
      overflowY: "auto",
      position: "fixed",
      height: "100vh",
      width: SIDEBAR_WIDTH - 1,
      top: 0,
      left: 0,
      borderRight: "1px solid " + theme.sidebarColorLine,
      transform: "translateX(" + (sidebarVisible ? 0 : -SIDEBAR_WIDTH) + "px)",
      transition: "transform " + SIDEBAR_ANIMATION_DURATION + "s ease-in-out",
      WebkitOverflowScrolling: "touch",
      "@media (min-width: 1000px)": {
        transform: "translateX(0px)",
        transition: "none"
      }
    },
    navBackground: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      opacity: sidebarVisible ? 1 : 0,
      visibility: sidebarVisible ? "visible" : "hidden",
      transition: "opacity " + SIDEBAR_ANIMATION_DURATION + "s, visibility " + SIDEBAR_ANIMATION_DURATION + "s",
      "@media (min-width: 1000px)": {
        display: "none"
      }
    },
    content: {
      background: theme.background,
      boxSizing: "border-box",
      display: "flex",
      minHeight: "100vh",
      width: "100%",
      flexDirection: "column",
      position: "relative",
      zIndex: 0, // To create a new stacking context, see #223.
      "@media (min-width: 1000px)": {
        paddingLeft: SIDEBAR_WIDTH
      }
    }
  };
};

var AppLayout = function (_React$Component) {
  inherits(AppLayout, _React$Component);

  function AppLayout() {
    classCallCheck(this, AppLayout);

    var _this = possibleConstructorReturn(this, _React$Component.call(this));

    _this.toggleSidebar = _this.toggleSidebar.bind(_this);
    _this.state = {
      sidebarVisible: false
    };
    return _this;
  }

  AppLayout.prototype.toggleSidebar = function toggleSidebar(e) {
    e.preventDefault();
    this.setState({
      sidebarVisible: !this.state.sidebarVisible
    });
  };

  AppLayout.prototype.render = function render() {
    var _props = this.props,
        sideNav = _props.sideNav,
        theme = _props.theme,
        pages = _props.pages,
        page = _props.page;
    var sidebarVisible = this.state.sidebarVisible;


    var styles = getStyles$1(theme, sidebarVisible);

    var nextPage = pages[page.index + 1];
    var previousPage = pages[page.index - 1];

    return React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(styles.container, "label:AppLayout;", "label:AppLayout;") },
      React.createElement(
        "div",
        {
          className: theme.showSideNav ? /*#__PURE__*/css(styles.content, "label:AppLayout;") : /*#__PURE__*/css(_extends({}, styles.content, { "@media (min-width: 1000px)": {} }), "label:AppLayout;")
        },
        theme.showHeader && React.createElement(PageHeader, {
          theme: theme,
          title: page.title,
          superTitle: page.superTitle
        }),
        React.createElement(
          "div",
          { className: /*#__PURE__*/ /*#__PURE__*/css({ flexGrow: 1 }, "label:AppLayout;", "label:AppLayout;") },
          this.props.children
        ),
        !page.hideFromMenu && React.createElement(NavigationBar, {
          theme: theme,
          nextPage: nextPage,
          previousPage: previousPage
        })
      ),
      theme.showHeader && React.createElement(MenuIcon, {
        className: /*#__PURE__*/ /*#__PURE__*/css(styles.menuIcon, "label:AppLayout;", "label:AppLayout;"),
        onClick: this.toggleSidebar,
        onTouchEnd: this.toggleSidebar
      }),
      React.createElement("div", {
        className: /*#__PURE__*/ /*#__PURE__*/css(styles.navBackground, "label:AppLayout;", "label:AppLayout;"),
        onClick: this.toggleSidebar,
        onTouchEnd: this.toggleSidebar
      }),
      theme.showSideNav && React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(styles.sideNav, "label:AppLayout;", "label:AppLayout;") },
        sideNav
      )
    );
  };

  return AppLayout;
}(React.Component);

AppLayout.propTypes = {
  sideNav: PropTypes.node,
  children: PropTypes.node,
  theme: PropTypes.object.isRequired,
  page: pageShape.isRequired,
  pages: pagesShape.isRequired
};

var baseLinkStyle = {
  background: "none",
  border: "none",
  transition: "none"
};

var style$1 = function style(theme) {
  return {
    link: _extends({}, text(theme), baseLinkStyle, {
      borderTop: "1px solid " + theme.sidebarColorLine,
      color: theme.sidebarColorText,
      cursor: "pointer",
      display: "block",
      margin: 0,
      padding: "16px 40px",
      textDecoration: "none",
      "&:hover, &:active, &:focus": _extends({}, baseLinkStyle, {
        borderTop: "1px solid " + theme.sidebarColorLine,
        color: theme.sidebarColorTextActive,
        textDecoration: "none",
        background: "rgba(255,255,255,0.1)"
      })
    }),
    activeLink: {
      color: theme.sidebarColorTextActive,
      cursor: "auto",
      padding: "16px 40px 8px 40px",
      "&:hover, &:active, &:focus": _extends({}, baseLinkStyle, {
        borderTop: "1px solid " + theme.sidebarColorLine,
        color: theme.sidebarColorTextActive,
        textDecoration: "none",
        background: "none"
      }),
      "&:last-child": {
        padding: "16px 40px"
      }
    },
    listItem: {
      background: "none",
      margin: 0,
      padding: 0
    },
    nestedLink: {
      borderTop: "none",
      borderBottom: "none",
      padding: "8px 24px 8px 60px",
      "&:hover, &:active, &:focus": _extends({}, baseLinkStyle, {
        color: theme.sidebarColorTextActive,
        textDecoration: "none",
        background: "rgba(255,255,255,0.1)"
      })
    },
    nestedActiveLink: {
      color: theme.sidebarColorTextActive,
      cursor: "auto",
      "&:hover, &:active, &:focus": _extends({}, baseLinkStyle, {
        color: theme.sidebarColorTextActive,
        textDecoration: "none",
        background: "none"
      })
    },
    nestedList: {
      borderTop: "none",
      borderBottom: "none",
      display: "block",
      listStyle: "none",
      margin: 0,
      padding: "0 0 8px 0"
    },
    nestedListHidden: {
      display: "none"
    }
  };
};

var NestedList = function NestedList(_ref, _ref2) {
  var _cx, _cx2;

  var theme = _ref.theme,
      pages = _ref.pages,
      title = _ref.title;
  var router = _ref2.router;

  var collapsed = !pages.map(function (d) {
    return d.path && router.isActive(d.path);
  }).filter(Boolean).length;

  var currentStyle = style$1(theme);

  var linkStyle = cx( /*#__PURE__*/css(currentStyle.link, "label:linkStyle;"), (_cx = {}, _cx[/*#__PURE__*/ /*#__PURE__*/css(currentStyle.activeLink, "label:linkStyle;", "label:linkStyle;")] = !collapsed, _cx));

  var listStyle = cx( /*#__PURE__*/css(currentStyle.nestedList, "label:listStyle;"), (_cx2 = {}, _cx2[/*#__PURE__*/ /*#__PURE__*/css(currentStyle.nestedListHidden, "label:listStyle;", "label:listStyle;")] = collapsed, _cx2));

  return React.createElement(
    "div",
    null,
    React.createElement(
      Link$1,
      { to: pages[0].path, className: linkStyle },
      title
    ),
    React.createElement(
      "ul",
      { className: listStyle },
      pages.filter(function (page) {
        return !page.hideFromMenu;
      }).map(function (page) {
        return React.createElement(ListItem$1, { key: page.id, page: page, nested: true, theme: theme });
      })
    )
  );
};

NestedList.propTypes = {
  pages: pagesShape.isRequired,
  title: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired
};

NestedList.contextTypes = {
  router: PropTypes.object.isRequired
};

var ListItem$1 = function (_React$Component) {
  inherits(ListItem, _React$Component);

  function ListItem() {
    classCallCheck(this, ListItem);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  ListItem.prototype.render = function render() {
    var _cx3, _cx4;

    var _props = this.props,
        page = _props.page,
        theme = _props.theme,
        nested = _props.nested;
    var path = page.path,
        pages = page.pages,
        title = page.title,
        menuTitle = page.menuTitle;


    var currentStyle = style$1(theme);

    var linkStyle = cx( /*#__PURE__*/css(currentStyle.link, "label:linkStyle;"), (_cx3 = {}, _cx3[/*#__PURE__*/ /*#__PURE__*/css(currentStyle.nestedLink, "label:linkStyle;", "label:linkStyle;")] = nested, _cx3));

    var activeLinkStyle = cx(linkStyle, (_cx4 = {}, _cx4[/*#__PURE__*/ /*#__PURE__*/css(currentStyle.activeLink, "label:activeLinkStyle;", "label:activeLinkStyle;")] = !nested, _cx4[/*#__PURE__*/ /*#__PURE__*/css(currentStyle.nestedActiveLink, "label:activeLinkStyle;", "label:activeLinkStyle;")] = nested, _cx4));

    return React.createElement(
      "li",
      { className: /*#__PURE__*/ /*#__PURE__*/css(currentStyle.listItem, "label:ListItem;", "label:ListItem;") },
      pages ? React.createElement(NestedList, _extends({}, this.props, page, { pages: pages })) : React.createElement(
        Link$1,
        {
          className: linkStyle,
          activeClassName: activeLinkStyle,
          to: path,
          onlyActiveOnIndex: path === "/"
        },
        menuTitle || title
      )
    );
  };

  return ListItem;
}(React.Component);

ListItem$1.propTypes = {
  page: pageShape.isRequired,
  theme: PropTypes.object.isRequired,
  nested: PropTypes.bool
};

function style$2(theme) {
  var logoBottomMargin = getFontSize(theme, 5);

  return {
    bar: {
      background: theme.sidebarColor,
      height: "100vh",
      display: "flex",
      flexDirection: "column"
    },
    h1: {
      boxSizing: "border-box",
      margin: 0,
      padding: "21px 38px",
      height: theme.pageHeadingHeight,
      display: "flex",
      justifyContent: "flex-end",
      flexDirection: "column",
      fontSize: "1em"
    },
    title: _extends({}, heading(theme, 1), {
      color: theme.sidebarColorHeading,
      fontWeight: 700,
      marginBottom: logoBottomMargin,
      marginTop: 0
    }),
    logo: {
      width: "100%",
      marginBottom: logoBottomMargin,
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "0 100%",
      flexGrow: 1
    },
    // Make it accessible to screen readers, hide visually, see http://webaim.org/techniques/css/invisiblecontent/#absolutepositioning
    logoTitle: {
      position: "absolute",
      left: "-10000px",
      top: "auto",
      width: "1px",
      height: "1px",
      overflow: "hidden"
    },
    list: {
      borderBottom: "1px solid " + theme.sidebarColorLine,
      listStyle: "none",
      margin: 0,
      padding: 0
    },
    listNested: {
      borderTop: "none",
      borderBottom: "none",
      padding: "0 0 15px 40px"
    },
    info: _extends({}, text(theme, -1), {
      padding: 20,
      color: theme.lightColor
    }),
    link: {
      color: theme.lightColor
    }
  };
}

var Menu = function (_React$Component) {
  inherits(Menu, _React$Component);

  function Menu() {
    classCallCheck(this, Menu);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Menu.prototype.render = function render() {
    var _props = this.props,
        theme = _props.theme,
        pageTree = _props.pageTree,
        logoSrc = _props.logoSrc,
        title = _props.title,
        basePath = _props.basePath;


    var currentStyle = style$2(theme);

    var titleString = title ? title : "";

    return React.createElement(
      "div",
      { className: /*#__PURE__*/ /*#__PURE__*/css(currentStyle.bar, "label:Menu;", "label:Menu;") },
      React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css({ flexGrow: 1 }, "label:Menu;", "label:Menu;") },
        React.createElement(
          Link$1,
          { to: basePath, className: /*#__PURE__*/ /*#__PURE__*/css({ textDecoration: "none" }, "label:Menu;", "label:Menu;") },
          React.createElement(
            "h1",
            { className: /*#__PURE__*/ /*#__PURE__*/css(currentStyle.h1, "label:Menu;", "label:Menu;") },
            logoSrc ? React.createElement(
              "div",
              {
                className: /*#__PURE__*/ /*#__PURE__*/css(_extends({}, currentStyle.logo, {
                  backgroundImage: "url(\"" + logoSrc + "\")"
                }), "label:Menu;", "label:Menu;")
              },
              React.createElement(
                "span",
                { className: /*#__PURE__*/ /*#__PURE__*/css(currentStyle.logoTitle, "label:Menu;", "label:Menu;") },
                titleString
              )
            ) : React.createElement(
              "div",
              { className: /*#__PURE__*/ /*#__PURE__*/css(currentStyle.title, "label:Menu;", "label:Menu;") },
              titleString
            )
          )
        ),
        React.createElement(
          "ul",
          { className: /*#__PURE__*/ /*#__PURE__*/css(currentStyle.list, "label:Menu;", "label:Menu;") },
          pageTree.filter(function (page) {
            return !page.hideFromMenu;
          }).map(function (page) {
            return React.createElement(ListItem$1, { key: page.id, page: page, theme: theme });
          })
        )
      ),
      React.createElement(
        "div",
        { className: /*#__PURE__*/ /*#__PURE__*/css(currentStyle.info, "label:Menu;", "label:Menu;") },
        "Powered by",
        " ",
        React.createElement(
          "a",
          {
            className: /*#__PURE__*/ /*#__PURE__*/css(currentStyle.link, "label:Menu;", "label:Menu;"),
            href: "https://www.catalog.style/",
            target: "_blank",
            rel: "noopener noreferrer"
          },
          "Catalog"
        )
      )
    );
  };

  return Menu;
}(React.Component);

Menu.propTypes = {
  pageTree: pagesShape.isRequired,
  theme: PropTypes.object.isRequired,
  logoSrc: PropTypes.string,
  basePath: PropTypes.string,
  title: PropTypes.string
};

Menu.defaultProps = {
  styles: [],
  scripts: []
};

var getDocumentTitle = function getDocumentTitle(_ref) {
  var title = _ref.title,
      page = _ref.page;
  return title === page.superTitle ? page.superTitle + " \u2013 " + page.title : title + " \u2013 " + page.superTitle + " \u2013 " + page.title;
};

var App = function (_React$Component) {
  inherits(App, _React$Component);

  function App() {
    classCallCheck(this, App);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  App.prototype.render = function render() {
    var catalog = this.context.catalog;

    return React.createElement(
      AppLayout,
      _extends({}, catalog, { sideNav: React.createElement(Menu, catalog) }),
      React.createElement(DocumentTitle, { title: getDocumentTitle(catalog) }),
      Children.only(this.props.children)
    );
  };

  return App;
}(React.Component);

App.contextTypes = {
  catalog: catalogShape.isRequired
};

App.propTypes = {
  children: PropTypes.element.isRequired
};

var fallbackPathRe = /\*$/;

var CatalogContext = function (_Component) {
  inherits(CatalogContext, _Component);

  function CatalogContext() {
    classCallCheck(this, CatalogContext);
    return possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  CatalogContext.prototype.getChildContext = function getChildContext() {
    var _props$configuration = this.props.configuration,
        title = _props$configuration.title,
        theme = _props$configuration.theme,
        responsiveSizes = _props$configuration.responsiveSizes,
        logoSrc = _props$configuration.logoSrc,
        pages = _props$configuration.pages,
        pageTree = _props$configuration.pageTree,
        specimens = _props$configuration.specimens,
        basePath = _props$configuration.basePath,
        publicUrl = _props$configuration.publicUrl,
        useBrowserHistory = _props$configuration.useBrowserHistory;
    var router = this.context.router;

    return {
      catalog: {
        page: pages.find(function (p) {
          return router.isActive(p.path) || fallbackPathRe.test(p.path);
        }),
        getSpecimen: function getSpecimen(specimen) {
          return specimens[specimen];
        },
        theme: theme,
        responsiveSizes: responsiveSizes,
        title: title,
        pages: pages.filter(function (p) {
          return !p.hideFromMenu;
        }),
        pagePaths: new Set(pages.map(function (p) {
          return p.path;
        })), // Used for internal link lookup
        pageTree: pageTree,
        basePath: basePath,
        publicUrl: publicUrl,
        logoSrc: logoSrc,
        useBrowserHistory: useBrowserHistory
      }
    };
  };

  CatalogContext.prototype.render = function render() {
    var children = this.props.children;

    return Children.only(children);
  };

  return CatalogContext;
}(Component);

CatalogContext.propTypes = {
  configuration: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
};

CatalogContext.contextTypes = {
  // From react-router
  router: PropTypes.object.isRequired
};

CatalogContext.childContextTypes = {
  catalog: catalogShape.isRequired
};

function createCatalogContext(config) {
  var ConfiguredCatalogContext = function ConfiguredCatalogContext(_ref) {
    var children = _ref.children;
    return React.createElement(
      CatalogContext,
      { configuration: config },
      React.createElement(
        App,
        null,
        children
      )
    );
  };

  ConfiguredCatalogContext.propTypes = {
    children: PropTypes.element.isRequired
  };

  return ConfiguredCatalogContext;
}

var SHOW_AFTER_MS = 500;

var loaderKeyframes = /*#__PURE__*/keyframes({
  "0%": { transform: "rotate(0deg)" },
  "50%": { transform: "rotate(180deg)" },
  "100%": { transform: "rotate(360deg)" }
}, "Loader", "label:loaderKeyframes;");

var styles = {
  spinner: {
    borderColor: "#EEEEEE #D3D3D3 #B6B6B6 #999999",
    borderRadius: "50px",
    borderStyle: "solid",
    borderWidth: "3px",
    height: "50px",
    margin: "calc(50% - 25px) auto 0 auto",
    width: "50px",
    animation: loaderKeyframes + " 2s linear infinite"
  },
  hidden: {
    display: "none"
  }
};

var Loader = function (_React$Component) {
  inherits(Loader, _React$Component);

  function Loader() {
    classCallCheck(this, Loader);

    var _this = possibleConstructorReturn(this, _React$Component.call(this));

    _this.state = {
      visible: false
    };
    return _this;
  }

  Loader.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this;

    this.interval = setTimeout(function () {
      return _this2.setState({ visible: true });
    }, SHOW_AFTER_MS);
  };

  Loader.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.interval) {
      clearTimeout(this.interval);
    }
  };

  Loader.prototype.render = function render() {
    var loader = this.state.visible ? styles.spinner : styles.hidden;

    return React.createElement("div", { className: /*#__PURE__*/ /*#__PURE__*/css(loader, "label:Loader;", "label:Loader;") });
  };

  return Loader;
}(React.Component);

var renderStyles$1 = function renderStyles(styles) {
  return styles.map(function (src, i) {
    return React.createElement("link", { key: i, href: src, rel: "stylesheet", type: "text/css" });
  });
};

var renderContent = function renderContent(Content) {
  return typeof Content === "string" ? React.createElement(
    Page,
    null,
    Content
  ) : React.createElement(Content, null);
};

var PageRenderer = function (_PureComponent) {
  inherits(PageRenderer, _PureComponent);

  function PageRenderer() {
    classCallCheck(this, PageRenderer);

    var _this = possibleConstructorReturn(this, _PureComponent.call(this));

    _this.jump = _this.jump.bind(_this);
    _this.jumpTimeout = null;
    return _this;
  }

  PageRenderer.prototype.componentDidMount = function componentDidMount() {
    this.context.catalog.page.scripts.forEach(runscript);
    this.jump();
  };

  PageRenderer.prototype.componentDidUpdate = function componentDidUpdate() {
    this.context.catalog.page.scripts.forEach(runscript);
    this.jump();
  };

  PageRenderer.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.jumpTimeout !== null) {
      cancelAnimationFrame(this.jumpTimeout);
      this.jumpTimeout = null;
    }
  };

  PageRenderer.prototype.jump = function jump() {
    var _props$location = this.props.location,
        a = _props$location.query.a,
        hash = _props$location.hash;

    // Hash is always defined, but may be an empty string. But the query param
    // is indeed optional and may be undefined. We do not want to be jumping
    // to the '#undefined' selector.

    if (hash !== "") {
      this.jumpToSelector(hash);
    } else if (a !== undefined && a !== "") {
      this.jumpToSelector("#" + a);
    }
  };

  PageRenderer.prototype.jumpToSelector = function jumpToSelector(selector) {
    var _this2 = this;

    if (this.jumpTimeout !== null) {
      cancelAnimationFrame(this.jumpTimeout);
      this.jumpTimeout = null;
    }

    // Don't freak out when hash is not a valid selector (e.g. #/foo)
    try {
      var el = document.querySelector(selector);
      if (el) {
        // Defer scrolling by one tick (when the page has completely rendered)
        this.jumpTimeout = requestAnimationFrame(function () {
          _this2.jumpTimeout = null;
          el.scrollIntoView();
        });
      }
    } catch (e) {
      // eslint-disable-line no-empty
    }
  };

  PageRenderer.prototype.render = function render() {
    var content = this.props.content;
    var styles = this.context.catalog.page.styles;

    return React.createElement(
      "div",
      null,
      renderStyles$1(styles),
      renderContent(content)
    );
  };

  return PageRenderer;
}(PureComponent);

PageRenderer.propTypes = {
  content: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  location: PropTypes.object.isRequired
};

PageRenderer.contextTypes = {
  catalog: catalogShape.isRequired
};

var fetchMarkdown = function fetchMarkdown(url) {
  return fetch(url, {
    credentials: "same-origin",
    headers: {
      Accept: "text/markdown, text/x-markdown, text/plain"
    }
  }).then(function (res) {
    if (res.status < 200 || res.status >= 300) {
      throw new Error("Failed to load content from\n      \n`" + url + "`.\n      \nReason: " + res.status + " " + res.statusText);
    }
    return res.text();
  });
};

// The contents of the page when loading the page fails. 'msg' is the error
// string or message with additional details.
var errorMarkdown = function errorMarkdown(msg) {
  return "\n```hint|warning\n" + msg + "\n```\n";
};

var PageLoader = function (_PureComponent) {
  inherits(PageLoader, _PureComponent);

  function PageLoader() {
    classCallCheck(this, PageLoader);

    var _this = possibleConstructorReturn(this, _PureComponent.call(this));

    _this.state = { content: null };
    return _this;
  }

  PageLoader.prototype.componentDidMount = function componentDidMount() {
    this.fetchPageContent();
  };

  PageLoader.prototype.fetchPageContent = function fetchPageContent() {
    var _this2 = this;

    var urlOrComponentPromise = this.props.urlOrComponentPromise;


    var contentPromise = typeof urlOrComponentPromise === "string" ? fetchMarkdown(urlOrComponentPromise).then(function (text) {
      return function () {
        return React.createElement(
          Page,
          null,
          text
        );
      };
    }) : urlOrComponentPromise().then(requireModuleDefault);

    contentPromise.then(function (content) {
      _this2.setState({ content: content });
    }, function (err) {
      _this2.setState({ content: errorMarkdown(err.message) });
    });
  };

  PageLoader.prototype.render = function render() {
    var location = this.props.location;

    var Content = this.state.content || Loader;
    return Content.__catalog_loader__ === true ? React.createElement(Content, { location: location }) : React.createElement(PageRenderer, { location: location, content: Content });
  };

  return PageLoader;
}(PureComponent);

PageLoader.propTypes = {
  urlOrComponentPromise: PropTypes.any.isRequired,
  location: PropTypes.object.isRequired
};

// eslint-disable-next-line react/display-name
var pageLoader = (function (urlOrComponentPromise) {
  return function (_ref // eslint-disable-line react/prop-types
  ) {
    var location = _ref.location;
    return React.createElement(PageLoader, {
      location: location,
      urlOrComponentPromise: urlOrComponentPromise
    });
  };
});

var pageToRoute = function pageToRoute(_ref) {
  var path = _ref.path,
      component = _ref.component,
      src = _ref.src;
  return {
    component: component ? requireModuleDefault(component) : pageLoader(src),
    path: path
  };
};

// eslint-disable-next-line react/prop-types
var pageToJSXRoute = function pageToJSXRoute(_ref2) {
  var path = _ref2.path,
      component = _ref2.component,
      src = _ref2.src;
  return React.createElement(Route, {
    key: path,
    path: path,
    component: component ? requireModuleDefault(component) : pageLoader(src)
  });
};

var autoConfigure = function autoConfigure(config) {
  warning$1(!config.__catalogConfig, "The `configure` function is deprecated; use `configureRoutes` or `configureJSXRoutes` directly.");

  return config.__catalogConfig ? config : configure(config);
};

var configureRoutes = (function (config) {
  var finalConfig = autoConfigure(config);
  return {
    component: createCatalogContext(finalConfig),
    childRoutes: finalConfig.pages.map(pageToRoute)
  };
});

var configureJSXRoutes = function configureJSXRoutes(config) {
  var finalConfig = autoConfigure(config);
  return React.createElement(
    Route,
    { component: createCatalogContext(finalConfig) },
    finalConfig.pages.map(pageToJSXRoute)
  );
};

var Catalog = function (_Component) {
  inherits(Catalog, _Component);

  function Catalog() {
    classCallCheck(this, Catalog);

    var _this = possibleConstructorReturn(this, _Component.call(this));

    _this.getKey = seqKey("CatalogRouter");
    return _this;
  }

  Catalog.prototype.render = function render() {
    var configuration = this.props;
    return React.createElement(Router, {
      key: this.getKey(),
      history: configuration.useBrowserHistory ? browserHistory : hashHistory,
      routes: configureRoutes(configuration),
      render: applyRouterMiddleware(useScroll())
    });
  };

  return Catalog;
}(Component);


Catalog.propTypes = {
  useBrowserHistory: PropTypes.bool
};

var render = (function (configuration, element) {
  ReactDOM.render(React.createElement(Catalog, configuration), element);
});

// This function simply intersperses the values between the strings, and
// passes the result as children to the Page component. No further
// transformation is done, the Page component itself processes strings
// as markdown.
//
// The most we could do at this point is to parse strings into MDAST (or
// a similar abstract form). We can't convert the markdown text into React
// elements because that requires the Catalog context.
//
// Values SHOULD be React Elements, strings, numbers, or anything
// stringifiable. The primary use case is to allow
// developers to easily instantiate React components in plain JavaScript,
// so that type checkers (flow, typescript) can verify that the correct
// props are pased to the component.
//
// > import {HintSpecimen, markdown} from 'catalog';
// > export const catalogPage = markdown`
// > # This is a page
// >
// > With a paragraph. And a number ${123}
// >
// > ${<HintSpecimen>And a hint</HintSpecimen>}
// >
// > ${<MyComponent isCustomComponent={'AWESOME'} />}
// > `;

var replaceLast = function replaceLast(f, arr) {
  arr[arr.length - 1] = f(arr[arr.length - 1]);
  return arr;
};

var markdownPage = function markdownPage(strings) {
  for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    values[_key - 1] = arguments[_key];
  }

  return createElement.apply(undefined, [Page, {}].concat(values.reduce(function (a, v, i) {
    // If it's a valid React element or array, just concat to the end of the array
    if (isValidElement(v) || Array.isArray(v)) {
      return a.concat(v, strings[i + 1]);
    }

    // String-concat v to last and next string part
    if (typeof v === "string" || typeof v === "number") {
      return replaceLast(function (last) {
        return last + v + strings[i + 1];
      }, a);
    }

    // Finally, try to stringify v
    return replaceLast(function (last) {
      return last + JSON.stringify(v) + strings[i + 1];
    }, a);
  }, [strings[0]])));
};

var Card = function Card(props) {
  warning$1(false, "The `Card` component is deprecated; use `Page` instead.");

  return React.createElement(Page, props);
};

// Configuration

export { render, configure, configureRoutes, configureJSXRoutes, markdownPage as markdown, pageLoader, DefaultTheme, DefaultResponsiveSizes, Catalog, Card, Page, Span, PageRenderer, Specimen, mapSpecimenOption, Audio$1 as AudioSpecimen, Code$1 as CodeSpecimen, Color$1 as ColorSpecimen, ColorPalette$1 as ColorPaletteSpecimen, Html$1 as HtmlSpecimen, Hint$1 as HintSpecimen, Image$2 as ImageSpecimen, Table$1 as TableSpecimen, Type$2 as TypeSpecimen, Download as DownloadSpecimen, ReactSpecimen$1 as ReactSpecimen, Video$1 as VideoSpecimen };
//# sourceMappingURL=catalog.es.js.map
