import React, {Component} from 'react';
import {Button, Input, Row, Col, Alert, message} from 'antd';
import {SwapOutlined, SyncOutlined} from '@ant-design/icons';
import './App.css';

import pako from 'pako';

const {TextArea} = Input;

class App extends Component {
  constructor(...args) {
    super(...args);
    
    this.state = {
      base64String: '',
      jsonString: '',
      fileDom: null,
      processing: false,
      downloaded: false,
    }
  }
  
  setBase64(e) {
    this.setState({
      base64String: e.target.value
    })
  }
  
  setJson(e) {
    this.setState({
      jsonString: e.target.value
    })
  }
  
  convert() {
    this.setState({
      processing: true
    });
    setTimeout(() => {
      this.setState({
        processing: false
      });
      
      if (this.state.base64String) {
        try {
          this.setState({
            jsonString: this.base64ToJson(this.state.base64String)
          })
        } catch (e) {
          console.error(e);
          message.error('转换失败！请核对base64数据格式后重试');
        }
        
      }
      
      if (this.state.jsonString) {
        if (!this.isJsonString(this.state.jsonString)) {
          message.error('spreadjs json 格式错误！ ');
          return;
        }
        try {
          this.setState({
            base64String: this.jsonToBase64(this.state.jsonString)
          })
        } catch (e) {
          console.error(e);
          message.error('转换失败！请核对json数据格式后重试');
        }
      }
    }, 1000)
  }
  
  base64ToJson(source) {
    const decodeStr = window.atob(source);
    const rawData = pako.inflate(decodeStr, {to: 'string'});
    return rawData;
  }
  
  jsonToBase64(source) {
    const gzipStr = pako.gzip(source, {to: 'string'});
    const encodeStr = window.btoa(gzipStr);
    return encodeStr;
  }
  
  isJsonString(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Object.prototype.toString.call(parsed) === '[object Object]') {
        return true;
      }
    } catch (e) {
    
    }
    return false;
  }
  
  listenFileDom = ref => {
    this.setState({
      fileDom: ref
    })
    ref.addEventListener('change', event => {
      this.parseFile(event.target.files[0]);
    })
  }
  
  parseFile(blob) {
    const reader = new FileReader();
    reader.readAsText(blob);
    reader.onload = (e) => {
      const result = e.target.result;
      this.convertInBack(result);
      this.state.fileDom.value = '';
    }
  }
  
  upload() {
    this.state.fileDom.click();
  }
  
  convertInBack(source) {
    let result = void 0;
    const link = document.createElement('a');
    if (this.isJsonString(source)) {
      result = this.jsonToBase64(source);
      link.download = 'spreadjs.txt';
    } else {
      result = this.base64ToJson(source);
      link.download = 'spreadjs.json';
    }
    const blob = new Blob([result]);
    link.href = URL.createObjectURL(blob);
    link.click();
    link.remove();
    this.setState({
      downloaded: true
    });
    setTimeout(() => {
      this.setState({
        downloaded: false
      })
    }, 5000);
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src='http://img.90paw.com/2020-04-23%2021-16-18.png' className="App-logo" alt="logo"/>
          {this.state.processing && <Alert message="稍等片刻，我们都希望它易如反掌。" type="info"/>}
          {this.state.downloaded && <Alert message="已下载！" type="success" showIcon/>}
          <div>
            <Button
              type="dashed"
              icon={<SyncOutlined/>}
              onClick={this.upload.bind(this)}
            >large file</Button>
          </div>
        </header>
        <main className="App-main">
          <Row className="main-row">
            <Col className="main-col" span={11}>
              <TextArea
                className="text-area"
                placeholder={'在此输入spreadjs base64字符串...'}
                value={this.state.base64String}
                onChange={this.setBase64.bind(this)}
              />
            </Col>
            <Col span={2} className="main-conver-warpper">
              <Button type="primary" icon={<SwapOutlined/>} onClick={this.convert.bind(this)}> Convert </Button>
            </Col>
            <Col className="main-col" span={11}>
              <TextArea
                className="text-area"
                placeholder={'在此输入spreadjs raw json字符串...'}
                value={this.state.jsonString}
                onChange={this.setJson.bind(this)}
              />
            </Col>
          </Row>
        </main>
        <input type='file' ref={this.listenFileDom} style={{display: 'none'}}></input>
      </div>
    )
  }
}

export default App;
