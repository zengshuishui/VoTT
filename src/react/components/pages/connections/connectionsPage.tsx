import shortid from "shortid";
import React from "react";
import { Route } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ConnectionItem from "./connectionItem";
import CondensedList from "../../common/condensedList";
import { IApplicationState, IConnection } from "../../../../models/applicationState.js";
import { RouteComponentProps } from "react-router-dom";
import IConnectionActions, * as connectionActions from "../../../../redux/actions/connectionActions";
import ConnectionForm from "./connectionForm";
import "./connectionsPage.scss";

export interface IConnectionPageProps extends RouteComponentProps, React.Props<ConnectionPage> {
    connections: IConnection[];
    actions: IConnectionActions;
}

export interface IConnectionPageState {
    connection: IConnection;
}

function mapStateToProps(state: IApplicationState) {
    return {
        connections: state.connections,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(connectionActions, dispatch),
    };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectionPage extends React.Component<IConnectionPageProps, IConnectionPageState> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            connection: null,
        };

        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onConnectionDelete = this.onConnectionDelete.bind(this);
    }

    public async componentDidMount() {
        const connectionId = this.props.match.params["connectionId"];
        if (connectionId) {
            this.loadConnection(connectionId);
        }
    }

    public componentDidUpdate = (prevProps) => {
        const prevConnectionId = prevProps.match.params["connectionId"];
        const newConnectionId = this.props.match.params["connectionId"];

        if (prevConnectionId !== newConnectionId) {
            this.loadConnection(newConnectionId);
        }
    }

    public render() {
        return (
            <div className="app-connections-page">
                <div className="app-connections-page-list bg-lighter-1">
                    <CondensedList
                        title="Connections"
                        newLinkTo={"/connections/create"}
                        onDelete={this.onConnectionDelete}
                        Component={ConnectionItem}
                        items={this.props.connections} />
                </div>

                <Route exact path="/connections" render={(props) =>
                    <div className="app-connections-page-detail m-3 text-light">
                        <h6>Please select a connection to edit</h6>
                    </div>
                } />

                <Route exact path="/connections/:connectionId" render={(props) =>
                    <ConnectionForm
                        connection={this.state.connection}
                        onSubmit={this.onFormSubmit} />
                } />
            </div>
        );
    }

    private async loadConnection(connectionId: string) {
        const connection = this.props.connections.find((connection) => connection.id === connectionId);
        if (connection) {
            this.setState({ connection });
        } else {
            this.setState({ connection: null });
        }
    }

    private onConnectionDelete = async (connection: IConnection) => {
        if (this.state && this.state.connection === connection) {
            this.props.history.push("/connections");
            this.setState({ connection: null });
        }

        await this.props.actions.deleteConnection(connection);
    }

    private onFormSubmit = async (connection: IConnection) => {
        if (!connection.id) {
            connection.id = shortid.generate();
        }
        await this.props.actions.saveConnection(connection);
        this.props.history.push("/connections");
    }
}
