var React = require('react');

var Timer = require('clockmaker').Timer;

var _ = require('../utils/lodash'),
  Loader = require('./loader'),
  RenderUtils = require('../utils/renderUtils'),
  Collapsible  = require('./collapsible'),
  JsonEditor  = require('./jsonEditor'),
  Pagination = require('./pagination'),
  SubmitButton = require('./submitButton'),
  GuardedStateMixin = require('../mixins/guardedState');




module.exports = React.createClass({
  propTypes: {
    modelName: React.PropTypes.string,
    columns: React.PropTypes.array,
    onRowClick: React.PropTypes.func,
    excludeRows: React.PropTypes.array,
  },

  mixins: [GuardedStateMixin],

  getInitialState: function() {
    return {
      loading: true, 
      shouldFetch: true,  // by default fetch
      error: null,
      perPage: 10,
      filter: {},
      sort: {},
      page: 1,
      newFilter: {},
      newSort: {},
      newPerPage: 10,
    };
  },

  getDefaultProps: function() {
    return {
      modelName: null,
      columns: null,
      onRowClick: null,
      excludeRows: [],
    };
  },

  _onRowClick: function(e) {
    e.preventDefault();

    if (this.props.onRowClick) {
      var item = _.find(this.state.rows, function(row) {
        return row._id === e.currentTarget.id;
      });

      this.props.onRowClick(item);
    }
  },

  _onPerPageChange: function(e) {
    try {
      var num = parseInt(e.currentTarget.value);

      if (Number.isNaN(num)) {
        throw new Error();
      }

      this.setState({
        newPerPage: num
      });
    } catch (err) {
      this.setState({
        newPerPage: null
      });            
    }
  },

  _onFilterChange: function(val) {
    try {
      this.setState({
        newFilter: JSON.parse(val)
      });
    } catch (err) {
      this.setState({
        newFilter: null
      });
    }
  },

  _onSortChange: function(val) {
    try {
      this.setState({
        newSort: JSON.parse(val),
      });
    } catch (err) {
      this.setState({
        newSort: null
      });
    }
  },

  _canSubmitSettingsForm: function() {
    return (null !== this.state.newFilter 
      && null !== this.state.newSort
      && null !== this.state.newPerPage
      );
  },

  _buildTableFilter: function() {
    var canSubmit = this._canSubmitSettingsForm();

    var items = [
      {
        label: (
          <span>
            <i className="fa fa-gear"></i>
            Change filter, sorting and paging
          </span>
        ),
        body: (
          <form onSubmit={this._onSubmitSettingsForm}>
            <div className="filter">
              <label>Filter:</label>
              <JsonEditor 
                value={this.state.newFilter}
                onChange={this._onFilterChange}
                height="100px"
                width="200px" />
            </div>
            <div className="filter">
              <label>Sort:</label>
              <JsonEditor 
                value={this.state.newSort}
                onChange={this._onSortChange}
                height="100px"
                width="200px" />
            </div>
            <div className="filter">
              <label>Per page:</label>
              <input type="text" value={this.state.newPerPage} onChange={this._onPerPageChange} />
            </div>
            <div className="action">
              <SubmitButton label="Apply" disabled={!canSubmit} />
            </div>
          </form>          
        )
      }
    ];

    return (
      <div className="model-filters">
        <Collapsible items={items} />
      </div>
    );
  },


  _buildDataRows: function() {
    var self = this;

    var columns = this.props.columns,
      rows = this.state.rows || [];

    var header = columns.map( c => (<th>{c.name}</th>) );

    var body = rows.map(function(row) {
      var values = columns.map(function(col) {
        
        var value = row[col.name],
          flipValue = null;

        // if value is a date
        if ('Date' === col.type) {
          flipValue = value;
          value = new Date(value).toString();
        }
        // if value is a boolean
        else if ('Boolean' === col.type) {
          value = '' + false;
        }
        // else if value is an array
        else if (Array.isArray(value)) {
          // extract sub key
          if (col.subKey) {
            value = _.pluck(value, col.subKey);
          }

          // construct list
          value = value.map(function(v) {
            return (<li key={v}>{v}</li>);
          });

          value = (<ul>{value}</ul>);

        }
        // stringify objects
        else if ('object' === typeof value) {
          value = JSON.stringify(value);
        }

        return (<td key={col.name} dataFlipValue={flipValue}>{value}</td>);
      });

      return (<tr id={row._id} key={row._id} onClick={self._onRowClick}>{values}</tr>);
    });

    return (
      <table className="hoverable bordered">
        <thead><tr>{header}</tr></thead>
        <tbody>{body}</tbody>
      </table>
    );
  },


  render: function() {
    var body = null;

    if (this.state.loading) {
      body = (
        <Loader />
      );
    } else {
      body = this._buildDataRows();
    }

    var tableFilter = this._buildTableFilter();

    return (
      <div className="model-table component">
        {tableFilter}
        {RenderUtils.buildError(this.state.error)}
        <Pagination 
          currentPage={this.state.page}
          resultsPerPage={this.state.perPage}
          totalResults={this.state.totalRows}
          onSelectPage={this._onSelectPage} />
        <div className="body">
          {body}
        </div>
      </div>
    );
  },


  componentDidMount: function() {
    this._fetchRows();
  },

  componentWillReceiveProps: function() {
    // fetch after next render
    this.setState({
      shouldFetch: true
    });
  },

  componentDidUpdate: function() {
    // need to fetch again
    if (this.state.shouldFetch) {
      this._fetchRows();
    }
  },


  _onSelectPage: function(newPage) {
    this.setState({
      page: newPage
    });

    this._fetchRows();
  },


  _onSubmitSettingsForm: function(e) {
    e.preventDefault();

    // reset page
    this.setState({
      filter: this.state.newFilter,
      sort: this.state.newSort,
      perPage: this.state.newPerPage,
      page: 1
    });

    this._fetchRows();
  },


  _fetchRows: function() {
    var self = this;

    // give time for values to propagate
    if (self._fetchRowsTimer) {
      self._fetchRowsTimer.stop();
    }

    self._fetchRowsTimer = Timer(function() {

      self.setState({
        shouldFetch: false, // turn off fetch flag
        loading: true,
        error: null,
      });

      var excludeIds = self.props.excludeRows.map(er => er._id);

      // fetch collection rows
      $.ajax({
        url: '/admin/models/model/rows?format=json',
        method: 'POST',
        data: {
          name: self.props.modelName,
          filter: JSON.stringify(self.state.filter),
          excludeIds: JSON.stringify(excludeIds),
          sort: JSON.stringify(self.state.sort),
          perPage: self.state.perPage,
          page: self.state.page,
        }
      })
        .done(function(data){        
          self.setStateIfMounted({
            totalRows: data.count,
            rows: data.rows,
          });
        })
        .fail(function(xhr) {
          self.setStateIfMounted({
            error: xhr
          });
        })
        .always(function() {
          self.setStateIfMounted({
            loading: false
          });
        })
      ;

    }, 200).start();

  },

});