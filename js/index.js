/*eslint-env browser */
/*global require: false */
'use strict';

var React = require('react');
require('bootstrap/dist/css/bootstrap.css');
var Rx = require('rx');
var vcf = require('vcf.js');
var d3 = require('d3");
require('rx.binding');
require('rx-dom');
require('css/custom.css');
var _ = require('underscore');
var brcaLogo = require('./img/brca_logo.png');
var ga4ghLogo = require('./img/ga4gh-logo-less.png');
var brcaLogoWithText = require('./img/BRCA-logo-with-text.png');
var hvpLogo = require('./img/hvp_logo.png');
var UNESCOLogo = require('./img/UNESCO-logo.jpg');
var ENIGMALogo = require('./img/enigma_logo.png');
var CIMBALogo = require('./img/cimba_logo.png');

var Markdown = require('react-remarkable');
var content = {
	home: require('../content/home.md'),
	'history': require('../content/history.md'),
	'brca1_2': require('../content/brca1_2.md'),
	'variation': require('../content/variationAndCancer.md')
};


var databaseUrl = require('file!../../brca-database.vcf');

var {Well, Grid, Col, Row, Input, Button, Navbar, CollapsableNav, Nav, Table,
	NavItem, DropdownButton, MenuItem, Panel} = require('react-bootstrap');


var VariantTable = require('./VariantTable');
var {Navigation, State, Link, Route, RouteHandler,
	HistoryLocation, run, DefaultRoute} = require('react-router');

var merge = (...objs) => _.extend({}, ...objs);

function mergeInfo(row) {
	var info = _.object(_.map(_.pairs(row.INFO), ([k, v]) => ['INFO$' + k, v]));
	return merge(info, _.omit(row, ['INFO']));
}

// XXX hard-coded GENE, PROB, REFS, PATH for now
function sanitize(data) {
	return _.map(data, (r, i) => merge({id: i, GENE: 'BRCA1', PROB: 0.23, REFS: 'sciencemag.org/content', PATH: 'pathogenic'}, mergeInfo(r)));
}

function readVcf(response) {
	var {header, records} = vcf.parser()(response);
	return {
		header: header,
		records: sanitize(records)
	};
}

var NavLink = React.createClass({
	render: function () {
		var {children, ...otherProps} = this.props;
		return (
			<li>
				<Link {...otherProps} role='button'>
					{children}
				</Link>
			</li>
		);
	}
});

var NavBarNew = React.createClass({
	close: function () {
		this.refs.about.setState({open: false});
	},
	// XXX drop the &nbsp for a css margin
	render: function () {
		return (
			<Navbar>
				<a className="navbar-brand" href="http://brcaexchange.org">
					<img style={{height: 28, width: 28, display: 'inline-block'}} src={brcaLogo} alt="brca logo"/>
					&nbsp;&nbsp;&nbsp;BRCA Exchange&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				</a>
				<CollapsableNav>
					<Nav navbar>
						<NavLink to='/'>Home</NavLink>
						<DropdownButton ref='about' title='About'>
							<NavLink onClick={this.close} to='/about/history'>
								History of the BRCA Exchange
							</NavLink>
							<NavLink onClick={this.close} to='/about/brca1_2'>
								What are BRCA1 and BRCA2?
							</NavLink>
							<NavLink onClick={this.close} to='/about/variation'>
								BRCA Variation and Cancer
							</NavLink>
						</DropdownButton>
						<NavLink to='/variants'>Variants</NavLink>
					</Nav>
					<Nav navbar right>
						<NavItem href='#'><input placeholder="Search Variant"></input>
							<Button className='btn-xs' style={{border: 0}}>
								<span className="glyphicon glyphicon-search"></span>
							</Button>
						</NavItem>
					</Nav>
				</CollapsableNav>
			</Navbar>
        );
    }
});

var Home = React.createClass({
	getInitialState() {
		return {
			index: 0,
			direction: null
		};
	},

	handleSelect(selectedIndex, selectedDirection) {
		this.setState({
			index: selectedIndex,
			direction: selectedDirection
		});
	},

	render: function() {
		return (
			<Grid>
				<Row style={{marginTop: 10}}>
					<Col md={4} mdOffset={4}>
						<Well>
							<div className="text-center">
								<input placeholder="Search Variant">
									<span className="glyphicon glyphicon-search"/>
								</input>
								<span className="glyphicon glyphicon-question-sign superscript"/>
							</div>
						</Well>
					</Col>
				</Row>
				<Row style={{marginTop: 100}}>
					<Col md={8} mdOffset={2}>
						<Markdown options={{html: true}} source={content.home} />
					</Col>
				</Row>
				<Row className='logo-block'>
					<Col md={6} mdOffset={3}>
						<ul className='logos'>
							<li><a href="http://genomicsandhealth.org">
								<img src={ga4ghLogo} alt="ga4gh logo" />
							</a></li>
							<li><a href="http://brcaexchange.org">
								<img src={brcaLogoWithText} alt="brca exchange logo" />
							</a></li>
							<li><a href="http://www.humanvariomeproject.org">
								<img src={hvpLogo} alt="human variome project logo" />
							</a></li>
							<li><a href="http://unesco.org">
								<img src={UNESCOLogo} alt="UNESCO logo" />
							</a></li>
							<br></br>
							<li><a href="http://enigmaconsortium.org">
								<img src={ENIGMALogo} alt="ENIGMA logo" />
							</a></li>
							<li><a href="http://apps.ccge.medschl.cam.ac.uk/consortia/cimba//">
								<img src={CIMBALogo} alt="CIMBA logo" />
							</a></li>
						</ul>
					</Col>
				</Row>
			</Grid>
		);
	}
});

var About = React.createClass({
	render: function() {
		var {page} = this.props.params;

		return (
			<Grid>
				<Row style={{marginTop: 100}}>
					<Col md={8} mdOffset={2}>
						<Markdown options={{html: true}} source={content[page]} />
					</Col>
				</Row>
			</Grid>
		);
	}
});

// sketch of function to filter rows on exact matches
function filterData(data, str) { //eslint-disable-line no-unused-vars
	var {records, header} = data;
	var filteredRecords = _.filter(records, row => {
		// row = {
		//   chrom: "17",
		//   pos: 1234,
		//   hgvs: "NC_0001:1234T>C"
		// }
		//
		return _.find(_.values(row), col => col.indexOf(str) !== -1);

	});
	return {
		records: filteredRecords,
		header: header
	};
}

var Database = React.createClass({
	mixins: [Navigation],
	showVariant: function ({id}) {
		this.transitionTo(`/variant/${id}`);
	},
	render: function () {
		var {show, data} = this.props;
		return (
			<div style={{display: show ? 'block' : 'none'}}>
				<div>
					<Row style={{marginTop: 50, marginBottom: 50}}>
						<div className="text-center">
							<span>place holder for database summary</span>
						</div>
					</Row>
					<Row style={{marginTop: 10}}>
						<div className="text-center">
							<input><span className="glyphicon glyphicon-search"/></input>
							<span className="glyphicon glyphicon-question-sign superscript"/>
						</div>
					</Row>
					<Row className="text-center" style={{fontSize: 12, color: "grey"}}>
						search for known variants
					</Row>
					<Row>
						<Col md={4} mdOffset={4}>
							<Panel header='Advanced filtering'>
								<DropdownButton title="Gene">
									<MenuItem>BRCA1</MenuItem>
									<MenuItem>BRCA2</MenuItem>
								</DropdownButton>
								<span className="glyphicon glyphicon-question-sig superscript"/>
								<DropdownButton title="Exon">
									<MenuItem>Any</MenuItem>
									<MenuItem>1</MenuItem>
									<MenuItem>2</MenuItem>
									<MenuItem>3</MenuItem>
									<MenuItem>4</MenuItem>
									<MenuItem>5</MenuItem>
								</DropdownButton>
								<span className="glyphicon glyphicon-question-sign superscript"/>
							</Panel>
						</Col>
						<Col md={1}>
							<Button>Download</Button>
						</Col>
					</Row>
				</div>


				<div style={{position: "relative", height: "100px"}}>
					{data?
						<Row>
							<Col md={10} mdOffset={1}>
								<VariantTable data={data.records} onRowClick={this.showVariant}/>
							</Col>
						</Row>
						: ''}
				</div>
			</div>
		);
	}
});

var MyVariant = React.createClass({ //eslint-disable-line no-unused-vars
	getInitialState: function () {
		return {
			data: null
		};
	},

	render: function() {
		var {data} = this.state;
		var {show} = this.props;
		return (
			<div style={{display: show ? 'block' : 'none'}}>
				<div className="text-center">
					<Input ref='file' type='file' onChange={this.fileChange}/>
				</div>
				<div style={{position: "relative", height: "100px"}}>
					{data?
						<Row>
							<Col md={10} mdOffset={1}>
								<VariantTable data={data}/>
							</Col>
						</Row>
						: ''}
				</div>
			</div>
		);
	},

	dataReady: function(ev) {
		this.setState({data: vcf.parser()(ev.currentTarget.result)});
	},


	fileChange: function () {
		var file = this.refs.file.getInputDOMNode().files[0],
		reader = new FileReader();
		// XXX This timeout allows the UI to update (close dialog) before loading
		// a potentially large file, which will block the UI.
		// This might also be solved by elminating the animation on Modal close,
		// which is probably the source of the problem.
		window.setTimeout(() => {
			reader.onload = this.dataReady;
			reader.readAsText(file);
		}, 100);
	}
});

var VariantDetail = React.createClass({
	render: function() {
		var {data, params: {id}} = this.props,
			variant = (data && data.records[id]) || {};

		variant = _.omit(variant, ['__HEADER__']);
		var rows = _.map(variant, (v, k) => <tr key={k}><td>{k}</td><td>{v}</td></tr>);
		return (
			<Grid>
				<Row style={{marginTop: 100}}>
					<div className='text-center'>
						<h3>Variant Detail</h3>
						<p>Placeholder for a better variant details page</p>
					</div>
				</Row>
				<Row>
					<Col md={8} mdOffset={2}>
						<Table striped bordered>
							<tbody>
								{rows}
							</tbody>
						</Table>
					</Col>
				</Row>
			</Grid>
		);
	}
});

var Application = React.createClass({
	mixins: [State],
	getInitialState: function () {
		return {data: null};
	},
	componentWillMount: function (){
		Rx.DOM.get(databaseUrl).subscribe(data =>
			this.setState({data: readVcf(data.response)}));
	},
	render: function () {
		var {data} = this.state;
		var path = this.getPath().slice(1);
		return (
			<div>
				<NavBarNew />
				<RouteHandler data={data}/>
				<Database show={path === 'variants'} data={data}/>
			</div>
		);
	}
});

var routes = (
	<Route handler={Application}>
		<DefaultRoute handler={Home}/>
		<Route path='about/:page' handler={About}/>
		<Route path='variants' />
		<Route path='variant/:id' handler={VariantDetail}/>
	</Route>
);

var main = document.getElementById('main');

run(routes, HistoryLocation, (Root) => {
  React.render(<Root/>, main);
});
