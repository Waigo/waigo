webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var DefaultRoute = Router.DefaultRoute;
	var RouteHandler = Router.RouteHandler;
	var Route = Router.Route;
	
	var PageRoutes = __webpack_require__(217);
	var PageRoute = __webpack_require__(218);
	
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

/***/ 217:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	
	var Router = __webpack_require__(166),
	    Link = Router.Link;
	
	var FilterList = __webpack_require__(206),
	    RenderUtils = __webpack_require__(208);
	
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

/***/ 218:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	
	var Router = __webpack_require__(166);
	
	var Loader = __webpack_require__(207),
	    SubmitBtn = __webpack_require__(212),
	    JsonEditor = __webpack_require__(210),
	    CodeView = __webpack_require__(205),
	    RenderUtils = __webpack_require__(208),
	    GuardedStateMixin = __webpack_require__(209);
	
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
	      var bodyJson = JSON.stringify(this.state.reqBody, null, 2);
	
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
	          value: bodyJson,
	          height: "300px" })
	      );
	    }
	
	    var qryStrJson = JSON.stringify(this.state.reqQuery, null, 2),
	        urlQryStr = $.param(this.state.reqQuery);
	
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
	          value: qryStrJson })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9yb3V0ZXMvYXBwLmpzIiwid2VicGFjazovLy8uL3BhZ2VzL3JvdXRlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wYWdlcy9yb3V0ZXMvcm91dGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxhQUFZLENBQUM7O0FBRWIsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxFQUFPLENBQUMsQ0FBQztBQUM3QixLQUFJLE1BQU0sR0FBRyxtQkFBTyxDQUFDLEdBQWMsQ0FBQyxDQUFDO0FBQ3JDLEtBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDdkMsS0FBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN2QyxLQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDOztBQUV6QixLQUFJLFVBQVUsR0FBRyxtQkFBTyxDQUFDLEdBQVMsQ0FBQyxDQUFDO0FBQ3BDLEtBQUksU0FBUyxHQUFHLG1CQUFPLENBQUMsR0FBUyxDQUFDLENBQUM7O0FBRW5DLEtBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDNUIsR0FBRSxXQUFXLEVBQUUsS0FBSzs7R0FFbEIsTUFBTSxFQUFFLFNBQVMsTUFBTSxHQUFHO0tBQ3hCLE9BQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3REO0FBQ0gsRUFBQyxDQUFDLENBQUM7O0FBRUgsS0FBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLGFBQWE7R0FDOUIsS0FBSztHQUNMLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRTtHQUNoQixLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDO0dBQzFFLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8s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QUFVLEVBQUU7V0FDOUIsUUFBUSxFQUFFLElBQUksQ0FBQyxvQkFBb0I7V0FDbkMsTUFBTSxFQUFFLE9BQU87V0FDZixLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUM7UUFDdkI7T0FDRCxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7T0FDZCxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztNQUNsRixDQUFDO0FBQ04sSUFBRzs7R0FFRCxNQUFNLEVBQUUsU0FBUyxNQUFNLEdBQUc7S0FDeEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLGFBQWE7T0FDaEQsS0FBSztPQUNMLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRTtPQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7QUFDdEIsTUFBSyxHQUFHLEVBQUUsQ0FBQzs7S0FFUCxPQUFPLEtBQUssQ0FBQyxhQUFhO09BQ3hCLEtBQUs7T0FDTCxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUU7T0FDM0IsS0FBSyxDQUFDLGFBQWE7U0FDakIsSUFBSTtTQUNKLElBQUk7U0FDSixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07U0FDakIsR0FBRztTQUNILElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRztRQUNmO09BQ0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFO09BQ3hCLElBQUksQ0FBQyxZQUFZLEVBQUU7TUFDcEIsQ0FBQztJQUNILEVBQUUsQ0FBQyxDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpO1xudmFyIERlZmF1bHRSb3V0ZSA9IFJvdXRlci5EZWZhdWx0Um91dGU7XG52YXIgUm91dGVIYW5kbGVyID0gUm91dGVyLlJvdXRlSGFuZGxlcjtcbnZhciBSb3V0ZSA9IFJvdXRlci5Sb3V0ZTtcblxudmFyIFBhZ2VSb3V0ZXMgPSByZXF1aXJlKFwiLi9pbmRleFwiKTtcbnZhciBQYWdlUm91dGUgPSByZXF1aXJlKFwiLi9yb3V0ZVwiKTtcblxudmFyIEFwcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiQXBwXCIsXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUm91dGVIYW5kbGVyLCB0aGlzLnByb3BzKTtcbiAgfVxufSk7XG5cbnZhciByb3V0ZXMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICBSb3V0ZSxcbiAgeyBoYW5kbGVyOiBBcHAgfSxcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChEZWZhdWx0Um91dGUsIHsgbmFtZTogXCJyb3V0ZXNcIiwgaGFuZGxlcjogUGFnZVJvdXRlcyB9KSxcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChSb3V0ZSwgeyBuYW1lOiBcInJvdXRlXCIsIHBhdGg6IFwiOmtleVwiLCBoYW5kbGVyOiBQYWdlUm91dGUgfSlcbik7XG5cblJvdXRlci5ydW4ocm91dGVzLCBSb3V0ZXIuSGFzaExvY2F0aW9uLCBmdW5jdGlvbiAoSGFuZGxlciwgc3RhdGUpIHtcbiAgUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUVsZW1lbnQoSGFuZGxlciwgeyByb3V0ZXM6IHN0YXRlLnJvdXRlcywgcGFyYW1zOiBzdGF0ZS5wYXJhbXMsIHF1ZXJ5OiBzdGF0ZS5xdWVyeSB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWFjdC1yb290XCIpKTtcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC9Vc2Vycy9yYW0vZGV2L2pzL3dhaWdvLWZyYW1ld29yay93YWlnby9+L2JhYmVsLWxvYWRlcj9leHBlcmltZW50YWwmb3B0aW9uYWw9cnVudGltZSEuL3BhZ2VzL3JvdXRlcy9hcHAuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgUm91dGVyID0gcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKSxcbiAgICBMaW5rID0gUm91dGVyLkxpbms7XG5cbnZhciBGaWx0ZXJMaXN0ID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvZmlsdGVyTGlzdFwiKSxcbiAgICBSZW5kZXJVdGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlscy9yZW5kZXJVdGlsc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiBcImV4cG9ydHNcIixcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJwYWdlLXJvdXRlc1wiIH0sXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEZpbHRlckxpc3QsIHtcbiAgICAgICAgYWpheFVybDogXCIvYWRtaW4vcm91dGVzP2Zvcm1hdD1qc29uXCIsXG4gICAgICAgIGFqYXhSZXNwb25zZURhdGFNYXBwZXI6IHRoaXMuX21hcEFqYXhEYXRhLFxuICAgICAgICBpdGVtRGlzcGxheU5hbWVGb3JtYXR0ZXI6IHRoaXMuX2dldEl0ZW1EaXNwbGF5TmFtZSxcbiAgICAgICAgaXRlbVJvdXRlOiBcInJvdXRlXCIgfSlcbiAgICApO1xuICB9LFxuXG4gIF9tYXBBamF4RGF0YTogZnVuY3Rpb24gX21hcEFqYXhEYXRhKGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YSB8fCB7fTtcblxuICAgIHJldHVybiAoZGF0YS5yb3V0ZXMgfHwgW10pLm1hcChmdW5jdGlvbiAocikge1xuICAgICAgLy8gR0VUIC9leGFtcGxlL3BhdGggIC0tID4gIGdldC9leGFtcGxlL3BhdGhcbiAgICAgIHIua2V5ID0gci5tZXRob2QudG9Mb3dlckNhc2UoKSArIHIudXJsLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgIHJldHVybiByO1xuICAgIH0pO1xuICB9LFxuXG4gIF9nZXRJdGVtRGlzcGxheU5hbWU6IGZ1bmN0aW9uIF9nZXRJdGVtRGlzcGxheU5hbWUoaXRlbSkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJzcGFuXCIsXG4gICAgICBudWxsLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcIm1ldGhvZFwiIH0sXG4gICAgICAgIGl0ZW0ubWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICAgICksXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcInNwYW5cIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwidXJsXCIgfSxcbiAgICAgICAgaXRlbS51cmxcbiAgICAgIClcbiAgICApO1xuICB9IH0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC9Vc2Vycy9yYW0vZGV2L2pzL3dhaWdvLWZyYW1ld29yay93YWlnby9+L2JhYmVsLWxvYWRlcj9leHBlcmltZW50YWwmb3B0aW9uYWw9cnVudGltZSEuL3BhZ2VzL3JvdXRlcy9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpO1xuXG52YXIgTG9hZGVyID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvbG9hZGVyXCIpLFxuICAgIFN1Ym1pdEJ0biA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL3N1Ym1pdEJ1dHRvblwiKSxcbiAgICBKc29uRWRpdG9yID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvanNvbkVkaXRvclwiKSxcbiAgICBDb2RlVmlldyA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2NvZGVWaWV3XCIpLFxuICAgIFJlbmRlclV0aWxzID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL3JlbmRlclV0aWxzXCIpLFxuICAgIEd1YXJkZWRTdGF0ZU1peGluID0gcmVxdWlyZShcIi4uLy4uL21peGlucy9ndWFyZGVkU3RhdGVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJleHBvcnRzXCIsXG5cbiAgY29udGV4dFR5cGVzOiB7XG4gICAgcm91dGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICB9LFxuXG4gIG1peGluczogW0d1YXJkZWRTdGF0ZU1peGluXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICB2YXIga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KHRoaXMuY29udGV4dC5yb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpLmtleSksXG4gICAgICAgIHNsYXNoUG9zID0ga2V5LmluZGV4T2YoXCIvXCIpLFxuICAgICAgICBtZXRob2QgPSBrZXkuc3Vic3RyKDAsIHNsYXNoUG9zKS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICB1cmwgPSBrZXkuc3Vic3RyKHNsYXNoUG9zKTtcblxuICAgIHJldHVybiB7XG4gICAgICB1cmw6IHVybCxcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgcmVxUXVlcnk6IHt9LFxuICAgICAgcmVxQm9keToge30gfTtcbiAgfSxcblxuICBvblN1Ym1pdDogZnVuY3Rpb24gb25TdWJtaXQoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBxcnlTdHIgPSAkLnBhcmFtKHRoaXMuc3RhdGUucmVxUXVlcnkpLFxuICAgICAgICBib2R5ID0gdGhpcy5zdGF0ZS5yZXFCb2R5O1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByZXN1bHQ6IG51bGwsXG4gICAgICBydW5uaW5nOiB0cnVlIH0pO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgdGltZW91dDogNTAwMCxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHVybDogdGhpcy5zdGF0ZS51cmwgKyAocXJ5U3RyLmxlbmd0aCA/IFwiP1wiICsgcXJ5U3RyIDogXCJcIiksXG4gICAgICBtZXRob2Q6IHRoaXMuc3RhdGUubWV0aG9kLFxuICAgICAgZGF0YVR5cGU6IFwidGV4dFwiLFxuICAgICAgZGF0YTogYm9keSB9KS5kb25lKGZ1bmN0aW9uIGdvdFJlc3VsdCgpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICByZXN1bHQ6IHtcbiAgICAgICAgICB4aHI6IGFyZ3VtZW50c1syXSB9XG4gICAgICB9KTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uIGdvdEVycm9yKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIHJlc3VsdDoge1xuICAgICAgICAgIHhocjogeGhyXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pLmFsd2F5cyhmdW5jdGlvbiBhbGxEb25lKCkge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIHJ1bm5pbmc6IGZhbHNlIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIF9idWlsZFJlc3VsdDogZnVuY3Rpb24gX2J1aWxkUmVzdWx0KCkge1xuICAgIGlmICh0aGlzLnN0YXRlLnJlc3VsdCkge1xuICAgICAgdmFyIHhociA9IHRoaXMuc3RhdGUucmVzdWx0LnhocjtcblxuICAgICAgdmFyIGRhdGEgPSB4aHIucmVzcG9uc2VUZXh0LFxuICAgICAgICAgIHJlc3VsdFR5cGUgPSA0MDAgPD0geGhyLnN0YXR1cyA/IFwiZXJyb3JcIiA6IFwic3VjY2Vzc1wiO1xuXG4gICAgICB2YXIgbWltZSA9IHhoci5nZXRSZXNwb25zZUhlYWRlcihcIkNvbnRlbnQtVHlwZVwiKTtcblxuICAgICAgdmFyIGxhYmVsID0gXCJsYWJlbCBcIiArIChcImVycm9yXCIgPT09IHJlc3VsdFR5cGUgPyBcInJlZFwiIDogXCJibHVlXCIpO1xuXG4gICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwicmVzdWx0XCIgfSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgIHsgY2xhc3NOYW1lOiByZXN1bHRUeXBlIH0sXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwibWV0YVwiIH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGxhYmVsIH0sXG4gICAgICAgICAgICAgIHhoci5zdGF0dXMsXG4gICAgICAgICAgICAgIFwiIFwiLFxuICAgICAgICAgICAgICB4aHIuc3RhdHVzVGV4dFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogbGFiZWwgfSxcbiAgICAgICAgICAgICAgbWltZVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogbGFiZWwgfSxcbiAgICAgICAgICAgICAgeGhyLmdldFJlc3BvbnNlSGVhZGVyKFwiQ29udGVudC1MZW5ndGhcIiksXG4gICAgICAgICAgICAgIFwiIGJ5dGVzXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICApLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29kZVZpZXcsIHsgbWltZTogbWltZSwgY29kZTogZGF0YSB9KVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KExvYWRlciwgeyB0ZXh0OiBcIlJlcXVlc3QgaW4gcHJvZ3Jlc3NcIiB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBfb25RdWVyeVN0cmluZ0NoYW5nZTogZnVuY3Rpb24gX29uUXVlcnlTdHJpbmdDaGFuZ2UodmFsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICByZXFRdWVyeTogdmFsLmxlbmd0aCA/IEpTT04ucGFyc2UodmFsKSA6IHt9LFxuICAgICAgICBjYW5TdWJtaXQ6IHRydWUgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcmVxUXVlcnk6IHt9LFxuICAgICAgICBjYW5TdWJtaXQ6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX29uQm9keUNoYW5nZTogZnVuY3Rpb24gX29uQm9keUNoYW5nZSh2YWwpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHJlcUJvZHk6IHZhbC5sZW5ndGggPyBKU09OLnBhcnNlKHZhbCkgOiB7fSxcbiAgICAgICAgY2FuU3VibWl0OiB0cnVlIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHJlcUJvZHk6IHt9LFxuICAgICAgICBjYW5TdWJtaXQ6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX2J1aWxkUmVxdWVzdEZvcm06IGZ1bmN0aW9uIF9idWlsZFJlcXVlc3RGb3JtKCkge1xuICAgIHZhciBib2R5ID0gXCJcIjtcbiAgICBpZiAoXCJQT1NUXCIgPT09IHRoaXMuc3RhdGUubWV0aG9kIHx8IFwiUFVUXCIgPT09IHRoaXMuc3RhdGUubWV0aG9kKSB7XG4gICAgICB2YXIgYm9keUpzb24gPSBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLnJlcUJvZHksIG51bGwsIDIpO1xuXG4gICAgICBib2R5ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiZm9ybS1ncm91cFwiIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgXCJGb3JtIGJvZHkgKEpTT04pXCJcbiAgICAgICAgKSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChKc29uRWRpdG9yLCB7XG4gICAgICAgICAgb25DaGFuZ2U6IHRoaXMuX29uQm9keUNoYW5nZSxcbiAgICAgICAgICB2YWx1ZTogYm9keUpzb24sXG4gICAgICAgICAgaGVpZ2h0OiBcIjMwMHB4XCIgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIHFyeVN0ckpzb24gPSBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLnJlcVF1ZXJ5LCBudWxsLCAyKSxcbiAgICAgICAgdXJsUXJ5U3RyID0gJC5wYXJhbSh0aGlzLnN0YXRlLnJlcVF1ZXJ5KTtcblxuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJmb3JtXCIsXG4gICAgICB7IG9uU3VibWl0OiB0aGlzLm9uU3VibWl0IH0sXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IGNsYXNzTmFtZTogXCJmb3JtLWdyb3VwXCIgfSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBcIlF1ZXJ5IHN0cmluZyAoSlNPTik6IFwiLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInN0cm9uZ1wiLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIHVybFFyeVN0clxuICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChKc29uRWRpdG9yLCB7XG4gICAgICAgICAgb25DaGFuZ2U6IHRoaXMuX29uUXVlcnlTdHJpbmdDaGFuZ2UsXG4gICAgICAgICAgaGVpZ2h0OiBcIjEwMHB4XCIsXG4gICAgICAgICAgdmFsdWU6IHFyeVN0ckpzb24gfSlcbiAgICAgICksXG4gICAgICB7IGJvZHk6IGJvZHkgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU3VibWl0QnRuLCB7IGxhYmVsOiBcIlJ1blwiLCBkaXNhYmxlZDogIXRoaXMuc3RhdGUuY2FuU3VibWl0IH0pXG4gICAgKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgZXJyb3IgPSB0aGlzLnN0YXRlLmVycm9yID8gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJlcnJvclwiIH0sXG4gICAgICB0aGlzLnN0YXRlLmVycm9yXG4gICAgKSA6IFwiXCI7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJwYWdlLXJvdXRlXCIgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiaDJcIixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgdGhpcy5zdGF0ZS5tZXRob2QsXG4gICAgICAgIFwiIFwiLFxuICAgICAgICB0aGlzLnN0YXRlLnVybFxuICAgICAgKSxcbiAgICAgIHRoaXMuX2J1aWxkUmVxdWVzdEZvcm0oKSxcbiAgICAgIHRoaXMuX2J1aWxkUmVzdWx0KClcbiAgICApO1xuICB9IH0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC9Vc2Vycy9yYW0vZGV2L2pzL3dhaWdvLWZyYW1ld29yay93YWlnby9+L2JhYmVsLWxvYWRlcj9leHBlcmltZW50YWwmb3B0aW9uYWw9cnVudGltZSEuL3BhZ2VzL3JvdXRlcy9yb3V0ZS5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImFkbWluLnJvdXRlcy5qcyJ9