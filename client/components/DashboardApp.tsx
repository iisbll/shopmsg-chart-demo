"use strict";
import * as React from 'react';
import { 
  Breadcrumb,
  Card,
  Col,
  DatePicker,
  Icon,
  Layout,
  Menu,
  Row,
  Switch
} from 'antd';
import { Chart } from 'react-google-charts';
import moment from 'moment';
import axios from 'axios';
import _ from 'underscore';

const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;
const { RangePicker } = DatePicker;

require('antd/dist/antd.less');
export default class DashboardApp extends React.Component {
  state = {
    collapsed: false,
    dateRange: [],
    optins: [],
    recipients: [],
    showOptins: true,
    showRecipients: true
  };

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(this.state.dateRange, prevState.dateRange)) {
      const { dateRange } = this.state;
      const START = moment(dateRange[0]).format('YYYY-MM-DD');
      const END = moment(dateRange[1]).format('YYYY-MM-DD');
      axios.get(`/api/reports/optins.json?from=${START}&to=${END}`)
        .then(({ data }) => {
          this.setState({ optins: data });
        });
      axios.get(`/api/reports/recipients.json?from=${START}&to=${END}`)
        .then(({ data }) => {
          this.setState({ recipients: data });
        });
    }
  }

  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  }

  onDateChange = (value) => {
    this.setState({ dateRange: value });
  }

  onToggle = (field, value) => {
    this.setState({ [field]: value })
  }

  render() {   
    const {
      dateRange,
      optins,
      recipients,
      showOptins,
      showRecipients
    } = this.state;

    const FIELDS = [
    {
      label: 'Date Range:',
      component: (
        <RangePicker
          className="col-18"
          onChange={this.onDateChange}
          value={dateRange}
        />
      )
    },
    {
      label: 'Show Optins:',
      component: (
        <Switch
          checked={showOptins}
          onChange={(val) => this.onToggle('showOptins', val)}
          size="small"
        />
      )
    },
    {
      label: 'Show Recipients:',
      component: (
        <Switch
          checked={showRecipients}
          onChange={(val) => this.onToggle('showRecipients', val)}
          size="small"
        />
      )
    }
  ];

    const HEAD: any[] = [{ type: 'string', label: 'Day' }];
    showOptins && HEAD.push('opt-ins');
    showRecipients && HEAD.push('recipients');
    
    const DATA: any[] = [HEAD];
    optins.forEach((item:any, i:number) => {
      const RECIPIENT: any = recipients[i];

      if (!_.isUndefined(RECIPIENT)) {
        const CURRENT = [item.date];
        showOptins && CURRENT.push(item.count);
        showRecipients && CURRENT.push(RECIPIENT.count);
        DATA.push(CURRENT);
      }
    });

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <div className="logo" />
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1">
              <Icon type="pie-chart" />
              <span>Reports</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="desktop" />
              <span>Option 2</span>
            </Menu.Item>
            <SubMenu
              key="sub1"
              title={<span><Icon type="user" /><span>User</span></span>}
            >
              <Menu.Item key="3">Tom</Menu.Item>
              <Menu.Item key="4">Bill</Menu.Item>
              <Menu.Item key="5">Alex</Menu.Item>
            </SubMenu>
            <SubMenu
              key="sub2"
              title={<span><Icon type="team" /><span>Team</span></span>}
            >
              <Menu.Item key="6">Team 1</Menu.Item>
              <Menu.Item key="8">Team 2</Menu.Item>
            </SubMenu>
            <Menu.Item key="9">
              <Icon type="file" />
              <span>File</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
         <Header style={{ background: '#fff', padding: '0 16px', fontSize: '24px', fontWeight: 500}}>
            Reports
          </Header>
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Reports</Breadcrumb.Item>
              <Breadcrumb.Item>Message Receipts & Optins</Breadcrumb.Item>
            </Breadcrumb>
            <Card>
              {
                FIELDS.map((field, i) => (
                  <Row 
                    gutter={16}
                    key={`row-${i}`}
                    style={{alignItems: 'center', padding: '10px 0'}}
                    type="flex"
                  >
                    <Col span={6} style={{ textAlign: 'right' }}>
                      {field.label}
                    </Col>
                    <Col span={18}>
                      {field.component}
                    </Col>
                  </Row>
                ))
              }
              
            </Card>
            {
              (DATA.length > 1 && (showOptins || showRecipients)) && (
                <Card style={{ margin: '10px 0px' }}>
                  <Chart 
                    width={'100%'}
                    height={'400px'}
                    chartType="Line"
                    loader={<div>Loading Chart</div>}
                    data={DATA}
                  />
                </Card>
              )
            }
            {
              (!_.isEmpty(dateRange) && _.isEmpty(optins)) && (
                <Card style={{ margin: '10px 0px' }}>
                  No results to display.
                </Card>
              )
            }
          </Content>
          <Footer style={{ textAlign: 'center' }}>ShopMessage ©2019</Footer>
        </Layout>
      </Layout>
    );
  }
}