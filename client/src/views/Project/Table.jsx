import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import {
  Card,
  CardBody,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  CardTitle,
  Button
} from 'reactstrap';
import NoDataComponent from '../../components/common/NoDataComponent';
import { pingComputers, deleteComputers } from '../../state/ducks/computer/actions';
import isEmpty from '../../utils/is-empty';

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: {},
      selectAll: 0
    };
  }

  toggleRow = mac => {
    const newSelected = Object.assign({}, this.state.selected);
    newSelected[mac] = !this.state.selected[mac];
    this.setState({
      selected: newSelected,
      selectAll: 2
    });
  };

  toggleSelectAll = () => {
    let newSelected = {};

    if (this.state.selectAll === 0) {
      this.props.computers.forEach(x => {
        newSelected[x.mac] = true;
      });
    }

    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  };

  componentDidMount = () => {
    this.refreshPing();
  };

  refreshPing = () => {
    if (isEmpty(this.props.computers) || isEmpty(this.props.agents)) {
      setTimeout(this.refreshPing, 3000);
      return;
    }

    const network = [];

    this.props.computers.map(computer => {
      return network.push(computer.ip);
    });

    const agentId = this.props.agents[0];

    this.props.pingComputers(network, agentId, this.props.computers).then(() => {
      setTimeout(this.refreshPing, 3000);
    });
  };

  render() {
    return (
      <Card>
        <CardTitle className="bg-light border-bottom p-3 mb-0 d-flex flex-row">
          <Button
            color="danger"
            size="sm"
            outline={true}
            className="mr-3"
            onClick={() => {
              const computers = [];
              this.props.computers.map(computer => {
                Object.keys(this.state.selected).map(selectedMac => {
                  if (computer.mac === selectedMac) {
                    computers.push(computer);
                  }
                });
              });

              this.props.deleteComputers(computers);
            }}
          >
            Delete
          </Button>
          <Button color="success" size="sm" outline={true} className="mr-3">
            Favorite
          </Button>
        </CardTitle>
        <CardBody>
          <ReactTable
            data={this.props.computers}
            columns={[
              {
                id: 'checkbox',
                accessor: '',
                Cell: ({ original }) => {
                  return (
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={this.state.selected[original.mac] === true}
                      onChange={() => this.toggleRow(original.mac)}
                    />
                  );
                },
                Header: x => {
                  return (
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={this.state.selectAll === 1}
                      ref={input => {
                        if (input) {
                          input.indeterminate = this.state.selectAll === 2;
                        }
                      }}
                      onChange={() => this.toggleSelectAll()}
                    />
                  );
                },
                sortable: false,
                filterable: false,
                width: 45,
                style: {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              },
              {
                Header: 'Name',
                accessor: 'name',
                minWidth: 150
              },
              {
                Header: 'IP Address',
                accessor: 'ip',
                minWidth: 150,
                Cell: e => (
                  <UncontrolledDropdown
                    style={{
                      position: 'static',
                      outline: 0
                    }}
                  >
                    <DropdownToggle
                      tag="button"
                      type="button"
                      caret
                      className="dropdownToggle"
                    >
                      {e.value}
                    </DropdownToggle>
                    <DropdownMenu>
                      <a href={`http://${e.value}`} target="_blank">
                        <DropdownItem className="DropdownItem">
                          HTTP {e.value}
                        </DropdownItem>
                      </a>
                      <a href={`https://${e.value}`} target="_blank">
                        <DropdownItem className="DropdownItem">
                          HTTPS {e.value}
                        </DropdownItem>
                      </a>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )
              },
              {
                Header: () => (
                  <div>
                    Ping <span className="text-muted small-text">ms</span>
                  </div>
                ),
                accessor: 'ping',
                minWidth: 100,
                Cell: e => {
                  const ping = e.value;
                  if (ping < 100) {
                    return (
                      <div
                        style={{
                          color: '#5cb85c',
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        {e.value}
                      </div>
                    );
                  }
                  if (ping < 300 && ping >= 100) {
                    return (
                      <div
                        style={{
                          color: '#ccbe21',
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        {e.value}
                      </div>
                    );
                  } else {
                    return (
                      <div
                        style={{
                          color: '#d9534f',
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        {e.value}
                      </div>
                    );
                  }
                }
              },
              {
                Header: 'Mac Address',
                accessor: 'mac',
                minWidth: 200
              },
              {
                Header: 'Location',
                accessor: 'location',
                minWidth: 150
              },
              {
                Header: () => (
                  <div>
                    Uptime <span className="text-muted small-text">dd:hh:mm</span>
                  </div>
                ),
                accessor: 'uptime',
                minWidth: 200
              },
              {
                Header: () => (
                  <div>
                    Download <span className="text-muted small-text">Mbps</span>
                  </div>
                ),
                accessor: 'download',
                minWidth: 150
              },
              {
                Header: () => (
                  <div>
                    Upload <span className="text-muted small-text">Mbps</span>
                  </div>
                ),
                accessor: 'upload',
                minWidth: 150
              }
            ]}
            style={{
              height: '750px',
              width: '100%',
              fontFamily: 'Source Code Pro',
              fontWeight: 'bold'
            }}
            filterable
            NoDataComponent={NoDataComponent}
            pageSize={15}
            showPagination={true}
            showPageSizeOptions={false}
            pageSizeOptions={[5, 10, 20, 25]}
            defaultFilterMethod={(filter, row) => {
              const id = filter.pivotId || filter.id;
              return row[id] !== undefined
                ? String(row[id].toLowerCase()).startsWith(
                    filter.value.toLowerCase()
                  ) ||
                    String(row[filter.id])
                      .toLowerCase()
                      .includes(filter.value.toLowerCase())
                : true;
            }}
            className="-highlight"
          />
        </CardBody>
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  computers: state.computer.computers,
  currentTheme: state.settings.currentTheme,
  agents: state.agent.agents,
  ping: state.computer.ping
});

Table.propTypes = {
  computers: PropTypes.array.isRequired,
  currentTheme: PropTypes.string.isRequired,
  pingComputers: PropTypes.func.isRequired,
  deleteComputers: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  { pingComputers, deleteComputers }
)(Table);
