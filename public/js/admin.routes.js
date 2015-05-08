webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(4);
	var Router = __webpack_require__(5);
	var DefaultRoute = Router.DefaultRoute;
	var RouteHandler = Router.RouteHandler;
	var Route = Router.Route;
	
	var PageRoutes = __webpack_require__(25);
	var PageRoute = __webpack_require__(26);
	
	var App = React.createClass({
	  displayName: "App",
	
	  render: function render() {
	    return React.createElement(RouteHandler, this.props);
	  }
	});
	
	var routes = React.createElement(
	  Route,
	  { handler: App },
	  React.createElement(DefaultRoute, { name: "routes", handler: PageRoutes }),
	  React.createElement(Route, { name: "route", path: ":key", handler: PageRoute })
	);
	
	Router.run(routes, Router.HashLocation, function (Handler, state) {
	  React.render(React.createElement(Handler, { routes: state.routes, params: state.params, query: state.query }), document.getElementById("react-root"));
	});

/***/ },

/***/ 25:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(4);
	
	var Router = __webpack_require__(5),
	    Link = Router.Link;
	
	var FilterList = __webpack_require__(9),
	    RenderUtils = __webpack_require__(19);
	
	module.exports = React.createClass({
	  displayName: "exports",
	
	  render: function render() {
	    return React.createElement(
	      "div",
	      { className: "page-routes" },
	      React.createElement(FilterList, {
	        ajaxUrl: "/admin/routes?format=json",
	        ajaxResponseDataMapper: this._mapAjaxData,
	        itemDisplayNameFormatter: this._getItemDisplayName,
	        itemRoute: "route" })
	    );
	  },
	
	  _mapAjaxData: function _mapAjaxData(data) {
	    data = data || {};
	
	    return (data.routes || []).map(function (r) {
	      // GET /example/path  -- >  get/example/path
	      r.key = r.method.toLowerCase() + r.url.toLowerCase();
	
	      return r;
	    });
	  },
	
	  _getItemDisplayName: function _getItemDisplayName(item) {
	    return React.createElement(
	      "span",
	      null,
	      React.createElement(
	        "span",
	        { className: "method" },
	        item.method.toUpperCase()
	      ),
	      React.createElement(
	        "span",
	        { className: "url" },
	        item.url
	      )
	    );
	  } });

/***/ },

/***/ 26:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(4);
	
	var Router = __webpack_require__(5);
	
	var Loader = __webpack_require__(11),
	    SubmitBtn = __webpack_require__(15),
	    JsonEditor = __webpack_require__(10),
	    CodeView = __webpack_require__(7),
	    RenderUtils = __webpack_require__(19),
	    GuardedStateMixin = __webpack_require__(17);
	
	module.exports = React.createClass({
	  displayName: "exports",
	
	  contextTypes: {
	    router: React.PropTypes.func
	  },
	
	  mixins: [GuardedStateMixin],
	
	  getInitialState: function getInitialState() {
	    var key = decodeURIComponent(this.context.router.getCurrentParams().key),
	        slashPos = key.indexOf("/"),
	        method = key.substr(0, slashPos).toUpperCase(),
	        url = key.substr(slashPos);
	
	    return {
	      url: url,
	      method: method,
	      reqQuery: {},
	      reqBody: {} };
	  },
	
	  onSubmit: function onSubmit(e) {
	    e.preventDefault();
	
	    var self = this;
	
	    var qryStr = $.param(this.state.reqQuery),
	        body = this.state.reqBody;
	
	    this.setState({
	      result: null,
	      running: true });
	
	    $.ajax({
	      async: true,
	      timeout: 5000,
	      cache: false,
	      url: this.state.url + (qryStr.length ? "?" + qryStr : ""),
	      method: this.state.method,
	      dataType: "text",
	      data: body }).done(function gotResult() {
	      self.setStateIfMounted({
	        result: {
	          xhr: arguments[2] }
	      });
	    }).fail(function gotError(xhr) {
	      self.setStateIfMounted({
	        result: {
	          xhr: xhr
	        }
	      });
	    }).always(function allDone() {
	      self.setStateIfMounted({
	        running: false });
	    });
	  },
	
	  _buildResult: function _buildResult() {
	    if (this.state.result) {
	      var xhr = this.state.result.xhr;
	
	      var data = xhr.responseText,
	          resultType = 400 <= xhr.status ? "error" : "success";
	
	      var mime = xhr.getResponseHeader("Content-Type");
	
	      var label = "label " + ("error" === resultType ? "red" : "blue");
	
	      return React.createElement(
	        "div",
	        { className: "result" },
	        React.createElement(
	          "div",
	          { className: resultType },
	          React.createElement(
	            "p",
	            { className: "meta" },
	            React.createElement(
	              "span",
	              { className: label },
	              xhr.status,
	              " ",
	              xhr.statusText
	            ),
	            React.createElement(
	              "span",
	              { className: label },
	              mime
	            ),
	            React.createElement(
	              "span",
	              { className: label },
	              xhr.getResponseHeader("Content-Length"),
	              " bytes"
	            )
	          ),
	          React.createElement(CodeView, { mime: mime, code: data })
	        )
	      );
	    } else {
	      if (this.state.running) {
	        return React.createElement(Loader, { text: "Request in progress" });
	      } else {
	        return "";
	      }
	    }
	  },
	
	  _onQueryStringChange: function _onQueryStringChange(val) {
	    try {
	      this.setState({
	        reqQuery: val.length ? JSON.parse(val) : {},
	        canSubmit: true });
	    } catch (err) {
	      this.setState({
	        reqQuery: {},
	        canSubmit: false
	      });
	    }
	  },
	
	  _onBodyChange: function _onBodyChange(val) {
	    try {
	      this.setState({
	        reqBody: val.length ? JSON.parse(val) : {},
	        canSubmit: true });
	    } catch (err) {
	      this.setState({
	        reqBody: {},
	        canSubmit: false
	      });
	    }
	  },
	
	  _buildRequestForm: function _buildRequestForm() {
	    var body = "";
	    if ("POST" === this.state.method || "PUT" === this.state.method) {
	      body = React.createElement(
	        "div",
	        { className: "form-group" },
	        React.createElement(
	          "label",
	          null,
	          "Form body (JSON)"
	        ),
	        React.createElement(JsonEditor, {
	          onChange: this._onBodyChange,
	          value: this.state.reqBody,
	          height: "300px" })
	      );
	    }
	
	    var urlQryStr = $.param(this.state.reqQuery);
	
	    return React.createElement(
	      "form",
	      { onSubmit: this.onSubmit },
	      React.createElement(
	        "div",
	        { className: "form-group" },
	        React.createElement(
	          "label",
	          null,
	          "Query string (JSON): ",
	          React.createElement(
	            "strong",
	            null,
	            urlQryStr
	          )
	        ),
	        React.createElement(JsonEditor, {
	          onChange: this._onQueryStringChange,
	          height: "100px",
	          value: this.state.reqQuery })
	      ),
	      { body: body },
	      React.createElement(SubmitBtn, { label: "Run", disabled: !this.state.canSubmit })
	    );
	  },
	
	  render: function render() {
	    var error = this.state.error ? React.createElement(
	      "div",
	      { className: "error" },
	      this.state.error
	    ) : "";
	
	    return React.createElement(
	      "div",
	      { className: "page-route" },
	      React.createElement(
	        "h2",
	        null,
	        this.state.method,
	        " ",
	        this.state.url
	      ),
	      this._buildRequestForm(),
	      this._buildResult()
	    );
	  } });

/***/ }

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9yb3V0ZXMvYXBwLmpzIiwid2VicGFjazovLy8uL3BhZ2VzL3JvdXRlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wYWdlcy9yb3V0ZXMvcm91dGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxhQUFZLENBQUM7O0FBRWIsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxDQUFPLENBQUMsQ0FBQztBQUM3QixLQUFJLE1BQU0sR0FBRyxtQkFBTyxDQUFDLENBQWMsQ0FBQyxDQUFDO0FBQ3JDLEtBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDdkMsS0FBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN2QyxLQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDOztBQUV6QixLQUFJLFVBQVUsR0FBRyxtQkFBTyxDQUFDLEVBQVMsQ0FBQyxDQUFDO0FBQ3BDLEtBQUksU0FBUyxHQUFHLG1CQUFPLENBQUMsRUFBUyxDQUFDLENBQUM7O0FBRW5DLEtBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDNUIsR0FBRSxXQUFXLEVBQUUsS0FBSzs7R0FFbEIsTUFBTSxFQUFFLFNBQVMsTUFBTSxHQUFHO0tBQ3hCLE9BQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3REO0FBQ0gsRUFBQyxDQUFDLENBQUM7O0FBRUgsS0FBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLGFBQWE7R0FDOUIsS0FBSztHQUNMLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRTtHQUNoQixLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDO0dBQzFFLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8s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YSxDQUFDLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztNQUNsRixDQUFDO0FBQ04sSUFBRzs7R0FFRCxNQUFNLEVBQUUsU0FBUyxNQUFNLEdBQUc7S0FDeEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLGFBQWE7T0FDaEQsS0FBSztPQUNMLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRTtPQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7QUFDdEIsTUFBSyxHQUFHLEVBQUUsQ0FBQzs7S0FFUCxPQUFPLEtBQUssQ0FBQyxhQUFhO09BQ3hCLEtBQUs7T0FDTCxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUU7T0FDM0IsS0FBSyxDQUFDLGFBQWE7U0FDakIsSUFBSTtTQUNKLElBQUk7U0FDSixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07U0FDakIsR0FBRztTQUNILElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRztRQUNmO09BQ0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFO09BQ3hCLElBQUksQ0FBQyxZQUFZLEVBQUU7TUFDcEIsQ0FBQztJQUNILEVBQUUsQ0FBQyxDIiwiZmlsZSI6ImFkbWluLnJvdXRlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG52YXIgUm91dGVyID0gcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKTtcbnZhciBEZWZhdWx0Um91dGUgPSBSb3V0ZXIuRGVmYXVsdFJvdXRlO1xudmFyIFJvdXRlSGFuZGxlciA9IFJvdXRlci5Sb3V0ZUhhbmRsZXI7XG52YXIgUm91dGUgPSBSb3V0ZXIuUm91dGU7XG5cbnZhciBQYWdlUm91dGVzID0gcmVxdWlyZShcIi4vaW5kZXhcIik7XG52YXIgUGFnZVJvdXRlID0gcmVxdWlyZShcIi4vcm91dGVcIik7XG5cbnZhciBBcHAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiBcIkFwcFwiLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFJvdXRlSGFuZGxlciwgdGhpcy5wcm9wcyk7XG4gIH1cbn0pO1xuXG52YXIgcm91dGVzID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgUm91dGUsXG4gIHsgaGFuZGxlcjogQXBwIH0sXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGVmYXVsdFJvdXRlLCB7IG5hbWU6IFwicm91dGVzXCIsIGhhbmRsZXI6IFBhZ2VSb3V0ZXMgfSksXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUm91dGUsIHsgbmFtZTogXCJyb3V0ZVwiLCBwYXRoOiBcIjprZXlcIiwgaGFuZGxlcjogUGFnZVJvdXRlIH0pXG4pO1xuXG5Sb3V0ZXIucnVuKHJvdXRlcywgUm91dGVyLkhhc2hMb2NhdGlvbiwgZnVuY3Rpb24gKEhhbmRsZXIsIHN0YXRlKSB7XG4gIFJlYWN0LnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KEhhbmRsZXIsIHsgcm91dGVzOiBzdGF0ZS5yb3V0ZXMsIHBhcmFtczogc3RhdGUucGFyYW1zLCBxdWVyeTogc3RhdGUucXVlcnkgfSksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVhY3Qtcm9vdFwiKSk7XG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAvVXNlcnMvcmFtL2Rldi9qcy93YWlnby1mcmFtZXdvcmsvd2FpZ28vfi9iYWJlbC1sb2FkZXI/ZXhwZXJpbWVudGFsJm9wdGlvbmFsPXJ1bnRpbWUhLi9wYWdlcy9yb3V0ZXMvYXBwLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIFJvdXRlciA9IHJlcXVpcmUoXCJyZWFjdC1yb3V0ZXJcIiksXG4gICAgTGluayA9IFJvdXRlci5MaW5rO1xuXG52YXIgRmlsdGVyTGlzdCA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2ZpbHRlckxpc3RcIiksXG4gICAgUmVuZGVyVXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvcmVuZGVyVXRpbHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJleHBvcnRzXCIsXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBcImRpdlwiLFxuICAgICAgeyBjbGFzc05hbWU6IFwicGFnZS1yb3V0ZXNcIiB9LFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChGaWx0ZXJMaXN0LCB7XG4gICAgICAgIGFqYXhVcmw6IFwiL2FkbWluL3JvdXRlcz9mb3JtYXQ9anNvblwiLFxuICAgICAgICBhamF4UmVzcG9uc2VEYXRhTWFwcGVyOiB0aGlzLl9tYXBBamF4RGF0YSxcbiAgICAgICAgaXRlbURpc3BsYXlOYW1lRm9ybWF0dGVyOiB0aGlzLl9nZXRJdGVtRGlzcGxheU5hbWUsXG4gICAgICAgIGl0ZW1Sb3V0ZTogXCJyb3V0ZVwiIH0pXG4gICAgKTtcbiAgfSxcblxuICBfbWFwQWpheERhdGE6IGZ1bmN0aW9uIF9tYXBBamF4RGF0YShkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEgfHwge307XG5cbiAgICByZXR1cm4gKGRhdGEucm91dGVzIHx8IFtdKS5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICAgIC8vIEdFVCAvZXhhbXBsZS9wYXRoICAtLSA+ICBnZXQvZXhhbXBsZS9wYXRoXG4gICAgICByLmtleSA9IHIubWV0aG9kLnRvTG93ZXJDYXNlKCkgKyByLnVybC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICByZXR1cm4gcjtcbiAgICB9KTtcbiAgfSxcblxuICBfZ2V0SXRlbURpc3BsYXlOYW1lOiBmdW5jdGlvbiBfZ2V0SXRlbURpc3BsYXlOYW1lKGl0ZW0pIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwic3BhblwiLFxuICAgICAgbnVsbCxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7IGNsYXNzTmFtZTogXCJtZXRob2RcIiB9LFxuICAgICAgICBpdGVtLm1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgICApLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcInVybFwiIH0sXG4gICAgICAgIGl0ZW0udXJsXG4gICAgICApXG4gICAgKTtcbiAgfSB9KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAvVXNlcnMvcmFtL2Rldi9qcy93YWlnby1mcmFtZXdvcmsvd2FpZ28vfi9iYWJlbC1sb2FkZXI/ZXhwZXJpbWVudGFsJm9wdGlvbmFsPXJ1bnRpbWUhLi9wYWdlcy9yb3V0ZXMvaW5kZXguanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgUm91dGVyID0gcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKTtcblxudmFyIExvYWRlciA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2xvYWRlclwiKSxcbiAgICBTdWJtaXRCdG4gPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9zdWJtaXRCdXR0b25cIiksXG4gICAgSnNvbkVkaXRvciA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2pzb25FZGl0b3JcIiksXG4gICAgQ29kZVZpZXcgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9jb2RlVmlld1wiKSxcbiAgICBSZW5kZXJVdGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlscy9yZW5kZXJVdGlsc1wiKSxcbiAgICBHdWFyZGVkU3RhdGVNaXhpbiA9IHJlcXVpcmUoXCIuLi8uLi9taXhpbnMvZ3VhcmRlZFN0YXRlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuXG4gIGNvbnRleHRUeXBlczoge1xuICAgIHJvdXRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICBtaXhpbnM6IFtHdWFyZGVkU3RhdGVNaXhpbl0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgdmFyIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5rZXkpLFxuICAgICAgICBzbGFzaFBvcyA9IGtleS5pbmRleE9mKFwiL1wiKSxcbiAgICAgICAgbWV0aG9kID0ga2V5LnN1YnN0cigwLCBzbGFzaFBvcykudG9VcHBlckNhc2UoKSxcbiAgICAgICAgdXJsID0ga2V5LnN1YnN0cihzbGFzaFBvcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdXJsOiB1cmwsXG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHJlcVF1ZXJ5OiB7fSxcbiAgICAgIHJlcUJvZHk6IHt9IH07XG4gIH0sXG5cbiAgb25TdWJtaXQ6IGZ1bmN0aW9uIG9uU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcXJ5U3RyID0gJC5wYXJhbSh0aGlzLnN0YXRlLnJlcVF1ZXJ5KSxcbiAgICAgICAgYm9keSA9IHRoaXMuc3RhdGUucmVxQm9keTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcmVzdWx0OiBudWxsLFxuICAgICAgcnVubmluZzogdHJ1ZSB9KTtcblxuICAgICQuYWpheCh7XG4gICAgICBhc3luYzogdHJ1ZSxcbiAgICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB1cmw6IHRoaXMuc3RhdGUudXJsICsgKHFyeVN0ci5sZW5ndGggPyBcIj9cIiArIHFyeVN0ciA6IFwiXCIpLFxuICAgICAgbWV0aG9kOiB0aGlzLnN0YXRlLm1ldGhvZCxcbiAgICAgIGRhdGFUeXBlOiBcInRleHRcIixcbiAgICAgIGRhdGE6IGJvZHkgfSkuZG9uZShmdW5jdGlvbiBnb3RSZXN1bHQoKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgcmVzdWx0OiB7XG4gICAgICAgICAgeGhyOiBhcmd1bWVudHNbMl0gfVxuICAgICAgfSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbiBnb3RFcnJvcih4aHIpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICByZXN1bHQ6IHtcbiAgICAgICAgICB4aHI6IHhoclxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KS5hbHdheXMoZnVuY3Rpb24gYWxsRG9uZSgpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBydW5uaW5nOiBmYWxzZSB9KTtcbiAgICB9KTtcbiAgfSxcblxuICBfYnVpbGRSZXN1bHQ6IGZ1bmN0aW9uIF9idWlsZFJlc3VsdCgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5yZXN1bHQpIHtcbiAgICAgIHZhciB4aHIgPSB0aGlzLnN0YXRlLnJlc3VsdC54aHI7XG5cbiAgICAgIHZhciBkYXRhID0geGhyLnJlc3BvbnNlVGV4dCxcbiAgICAgICAgICByZXN1bHRUeXBlID0gNDAwIDw9IHhoci5zdGF0dXMgPyBcImVycm9yXCIgOiBcInN1Y2Nlc3NcIjtcblxuICAgICAgdmFyIG1pbWUgPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJDb250ZW50LVR5cGVcIik7XG5cbiAgICAgIHZhciBsYWJlbCA9IFwibGFiZWwgXCIgKyAoXCJlcnJvclwiID09PSByZXN1bHRUeXBlID8gXCJyZWRcIiA6IFwiYmx1ZVwiKTtcblxuICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcInJlc3VsdFwiIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICB7IGNsYXNzTmFtZTogcmVzdWx0VHlwZSB9LFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIm1ldGFcIiB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBsYWJlbCB9LFxuICAgICAgICAgICAgICB4aHIuc3RhdHVzLFxuICAgICAgICAgICAgICBcIiBcIixcbiAgICAgICAgICAgICAgeGhyLnN0YXR1c1RleHRcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGxhYmVsIH0sXG4gICAgICAgICAgICAgIG1pbWVcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGxhYmVsIH0sXG4gICAgICAgICAgICAgIHhoci5nZXRSZXNwb25zZUhlYWRlcihcIkNvbnRlbnQtTGVuZ3RoXCIpLFxuICAgICAgICAgICAgICBcIiBieXRlc1wiXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSxcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENvZGVWaWV3LCB7IG1pbWU6IG1pbWUsIGNvZGU6IGRhdGEgfSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuc3RhdGUucnVubmluZykge1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgdGV4dDogXCJSZXF1ZXN0IGluIHByb2dyZXNzXCIgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgX29uUXVlcnlTdHJpbmdDaGFuZ2U6IGZ1bmN0aW9uIF9vblF1ZXJ5U3RyaW5nQ2hhbmdlKHZhbCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcmVxUXVlcnk6IHZhbC5sZW5ndGggPyBKU09OLnBhcnNlKHZhbCkgOiB7fSxcbiAgICAgICAgY2FuU3VibWl0OiB0cnVlIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHJlcVF1ZXJ5OiB7fSxcbiAgICAgICAgY2FuU3VibWl0OiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkJvZHlDaGFuZ2U6IGZ1bmN0aW9uIF9vbkJvZHlDaGFuZ2UodmFsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICByZXFCb2R5OiB2YWwubGVuZ3RoID8gSlNPTi5wYXJzZSh2YWwpIDoge30sXG4gICAgICAgIGNhblN1Ym1pdDogdHJ1ZSB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICByZXFCb2R5OiB7fSxcbiAgICAgICAgY2FuU3VibWl0OiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIF9idWlsZFJlcXVlc3RGb3JtOiBmdW5jdGlvbiBfYnVpbGRSZXF1ZXN0Rm9ybSgpIHtcbiAgICB2YXIgYm9keSA9IFwiXCI7XG4gICAgaWYgKFwiUE9TVFwiID09PSB0aGlzLnN0YXRlLm1ldGhvZCB8fCBcIlBVVFwiID09PSB0aGlzLnN0YXRlLm1ldGhvZCkge1xuICAgICAgYm9keSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcImZvcm0tZ3JvdXBcIiB9LFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwibGFiZWxcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFwiRm9ybSBib2R5IChKU09OKVwiXG4gICAgICAgICksXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSnNvbkVkaXRvciwge1xuICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLl9vbkJvZHlDaGFuZ2UsXG4gICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUucmVxQm9keSxcbiAgICAgICAgICBoZWlnaHQ6IFwiMzAwcHhcIiB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB2YXIgdXJsUXJ5U3RyID0gJC5wYXJhbSh0aGlzLnN0YXRlLnJlcVF1ZXJ5KTtcblxuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJmb3JtXCIsXG4gICAgICB7IG9uU3VibWl0OiB0aGlzLm9uU3VibWl0IH0sXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IGNsYXNzTmFtZTogXCJmb3JtLWdyb3VwXCIgfSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBcIlF1ZXJ5IHN0cmluZyAoSlNPTik6IFwiLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInN0cm9uZ1wiLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIHVybFFyeVN0clxuICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChKc29uRWRpdG9yLCB7XG4gICAgICAgICAgb25DaGFuZ2U6IHRoaXMuX29uUXVlcnlTdHJpbmdDaGFuZ2UsXG4gICAgICAgICAgaGVpZ2h0OiBcIjEwMHB4XCIsXG4gICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUucmVxUXVlcnkgfSlcbiAgICAgICksXG4gICAgICB7IGJvZHk6IGJvZHkgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU3VibWl0QnRuLCB7IGxhYmVsOiBcIlJ1blwiLCBkaXNhYmxlZDogIXRoaXMuc3RhdGUuY2FuU3VibWl0IH0pXG4gICAgKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgZXJyb3IgPSB0aGlzLnN0YXRlLmVycm9yID8gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJlcnJvclwiIH0sXG4gICAgICB0aGlzLnN0YXRlLmVycm9yXG4gICAgKSA6IFwiXCI7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJwYWdlLXJvdXRlXCIgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiaDJcIixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgdGhpcy5zdGF0ZS5tZXRob2QsXG4gICAgICAgIFwiIFwiLFxuICAgICAgICB0aGlzLnN0YXRlLnVybFxuICAgICAgKSxcbiAgICAgIHRoaXMuX2J1aWxkUmVxdWVzdEZvcm0oKSxcbiAgICAgIHRoaXMuX2J1aWxkUmVzdWx0KClcbiAgICApO1xuICB9IH0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC9Vc2Vycy9yYW0vZGV2L2pzL3dhaWdvLWZyYW1ld29yay93YWlnby9+L2JhYmVsLWxvYWRlcj9leHBlcmltZW50YWwmb3B0aW9uYWw9cnVudGltZSEuL3BhZ2VzL3JvdXRlcy9yb3V0ZS5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=