#!/usr/bin/env babel-node

import React from 'react'
import ReactDOM from 'react-dom'
import map from 'lodash/map'

import PouchManager from '../../src/PouchManager'
import { getReplicationURL } from '../../src/CozyPouchLink'
import AccessToken from '../../src/AccessToken'

const DOCTYPE = 'io.cozy.bank.operations'

const LabeledInput = ({ label, onChange, value }) => (
  <div className="input-group mb-3">
    <div className="input-group-prepend">
      <span className="input-group-text" id="inputGroup-sizing-default">
        {label}
      </span>
    </div>
    <input
      onChange={onChange}
      value={value}
      type="text"
      className="form-control"
      aria-label={label}
      aria-describedby="inputGroup-sizing-default"
    />
  </div>
)

class App extends React.Component {
  constructor(props, context) {
    super(props, context)
    const lsState = localStorage.getItem('state')
      ? JSON.parse(localStorage.getItem('state'))
      : null
    const commonState = {
      replicating: false
    }
    const savedState = lsState
      ? {
          url: lsState.url,
          token: AccessToken.fromJSON(lsState.token)
        }
      : {
          url: '',
          token: ''
        }
    this.state = { ...commonState, ...savedState }

    this.handleStart = this.handleStart.bind(this)
    this.handleStop = this.handleStop.bind(this)
    this.handleReset = this.handleReset.bind(this)
    this.handleChangeToken = this.handleChangeToken.bind(this)
    this.handleChangeURL = this.handleChangeURL.bind(this)
    this.getReplicationURL = this.getReplicationURL.bind(this)
    this.createManager = this.createManager.bind(this)
  }

  getReplicationURL(doctype) {
    return getReplicationURL(this.state.url, this.state.token, doctype)
  }

  async componentDidMount() {
    await this.createManager()
    this.displayDocs()
  }

  componentWillUnmount() {
    this.stop()
  }

  saveState(stateUpdate) {
    this.setState(stateUpdate, () => {
      const newState = this.state
      localStorage.setItem(
        'state',
        JSON.stringify({
          url: newState.url,
          token: newState.token && newState.token.toJSON()
        })
      )
    })
  }

  async createManager() {
    this.manager = new PouchManager([DOCTYPE], {
      replicationDelay: 2 * 1000,
      getReplicationURL: this.getReplicationURL,
      onError: err => {
        if (/Expired token/.test(err.error)) {
          console.log('You need to refresh the token')
        }
        this.setState({ error: err.error })
      },
      onSync: async res => {
        this.setState({
          lastSync: new Date(),
          error: null
        })
        this.displayDocs()
      }
    })
    await this.manager.init()
  }

  async displayDocs() {
    const docsByDoctype = {}
    const start = new Date()
    await Promise.all(
      map(this.manager.pouches, async (pouch, doctype) => {
        const resp = await pouch.allDocs({ include_docs: true })
        const docs = resp.rows.map(row => row.doc)
        docsByDoctype[doctype] = docs
      })
    )
    const end = new Date()
    this.setState({
      docs: docsByDoctype,
      elapsed: end - start
    })
  }

  start(ev) {
    if (!this.manager) {
      this.createManager()
    }
    this.manager.startReplicationLoop()
    this.setState({ replicating: true })
  }

  stop() {
    if (this.manager) {
      this.manager.stopReplicationLoop()
      this.setState({ replicating: false })
    }
  }

  reset() {
    this.manager.destroy()
    this.manager = null
  }

  handleStart(ev) {
    ev.preventDefault()
    this.start()
  }

  handleStop(ev) {
    ev.preventDefault()
    this.stop()
  }

  handleReset(ev) {
    ev.preventDefault()
    this.reset()
  }

  handleChangeToken({ target: { value } }) {
    const token = new AccessToken({
      accessToken: value
    })
    this.saveState({ token })
  }

  handleChangeURL({ target: { value } }) {
    this.saveState({ url: value })
  }

  render() {
    return (
      <div className="container-fluid">
        <h1>Periodic sync</h1>
        {this.state.error ? (
          <div className="alert alert-danger" role="alert">
            <pre>{JSON.stringify(this.state.error)}</pre>
          </div>
        ) : null}
        <form className="form">
          <LabeledInput
            label="URL"
            type="text"
            value={this.state.url}
            onChange={this.handleChangeURL}
          />
          <LabeledInput
            label="Token"
            type="text"
            value={this.state.token.accessToken}
            onChange={this.handleChangeToken}
          />
          <button className="btn btn-primary" onClick={this.handleStart}>
            start
          </button>
          <button className="btn btn-secondary" onClick={this.handleStop}>
            stop
          </button>
          <button className="btn btn-danger" onClick={this.handleReset}>
            reset
          </button>
        </form>
        <div>Replicating: {this.state.replicating + ''}</div>
        {this.state.lastSync && (
          <div>Last synced: {this.state.lastSync.toString()}</div>
        )}
        {this.state.elapsed && (
          <div>
            Time for allDocs: {this.state.elapsed}
            ms
          </div>
        )}
        {map(this.state.docs, (docs, doctype) => (
          <div key={doctype}>
            <p>Doctype: {doctype}</p>
            <table className="table">
              <thead>
                <tr>
                  <th>date</th>
                  <th>label</th>
                  <th>amount</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc._id}>
                    <td>{doc.date}</td>
                    <td>{doc.label}</td>
                    <td>{doc.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    )
  }
}

const root = document.querySelector('#root')
ReactDOM.render(<App />, root)
