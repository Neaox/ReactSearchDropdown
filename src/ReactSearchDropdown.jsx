import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
//import { VirtualScroll } from 'react-virtualized';

const escapeRegexString = input => input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

const filters = {
	label: (searchTerm) => {
		const escapedSearchTerm = escapeRegexString(searchTerm);
		const beginsWithRegex = new RegExp("^" + escapedSearchTerm, "igm");

		return function(option, index) {
			const label = option.label;
			return label.search(beginsWithRegex) !== -1;
		}
	},
	value: (searchTerm) => {
		return function(option, index) {
			const value = option.value;
			return searchTerm === value;
		}
	}
};

filters['both'] = (searchTerm, option, index) => {
	return filters.label.call(this, searchTerm, option) || filters.value.call(this, searchTerm, option);
};

const Row = props => {
	return (
		<li className={ classnames({selected: props.selected }, "item") } onClick={ props.onClick }>{ props.option.label }</li>
	);
};

class ReactSearchDropdown extends React.Component {
	constructor(){
		super();

		this.state = {
			open: false,
			searchTerm: ''
		};		
	}

	render() {
		const selectedItem = this.getSelectedOption();
		const text = 	selectedItem
						? 	selectedItem.label
						: 	this.props.defaultText;

		return (
			<div className={ classnames("ui search selection dropdown", {active: this.state.open, visible: this.state.open}) } tabIndex="-1" onBlur={ this.onContainerBlur.bind(this) }>
				<i className="dropdown icon" onClick={ this.onDropdownIconClick.bind(this) }></i>
				<input className="search" autoComplete="off" tabIndex="0" value={ this.state.searchTerm } onChange={ this.onSearchChange.bind(this) } onFocus={ this.onSearchInputFocus.bind(this) } />
				<div className={ classnames({ filtered: this.state.searchTerm.length > 0, "default": !selectedItem }, "text") }>{ text }</div>
				{
					(this.state.open)
					? 	/*(this.props.useVirtualList)
						?	<VirtualScroll
								width={ this.GetListWidth() }
								height={ this.GetListHeight() }
								rowsCount={ this.props.options.length }
								rowHeight={ this.GetRowHeight() }
								rowRenderer={ index => this.rowRenderer(this.props.options[index], index) } />
						:*/ 	<ul className={ classnames(this.state.open ? "visible" : "hidden", "menu") } style={ this.state.open ? {display:"block !important"} : null }>
							{ this.state.filteredOptions.map(this.rowRenderer.bind(this)) }
							</ul>
					: 	null
				}
				</div>
		);
	}

	componentWillMount() {
		this.updateFilterSettings(this.props);
		this.setValue(this.props.value);
	}

	componentWillReceiveProps(newProps) {
		this.updateFilterSettings(newProps);
		this.setValue(newProps.value);
	}

	rowRenderer(option, index){
		const isSelectedOption = option.value === this.props.value;
		if(this.props.rowRenderer)
			return this.props.rowRenderer.call(this, option, index, isSelectedOption);
		else
			return <Row key={ option.key } option={ option } selected={ isSelectedOption } index={ index } onClick={ this.onOptionClick.bind(this, option, index) } />
	}

	onSearchInputFocus(event) {
		this.openDropdown();
	}

	onContainerBlur(event) {
		const container = ReactDOM.findDOMNode(this);
		const target = event.relatedTarget;

		if(target !== container && !container.contains(target))
			this.closeDropdown();
	}

	onDropdownIconClick(event) {
		this.toggleDropdown();
	}

	onSearchChange(event) {
		const searchTerm = event.target.value;

		this.setState({
			searchTerm: searchTerm,
			filteredOptions: this.filterOptions(this.props.options, searchTerm)			
		});
	}

	onOptionClick(option, index, event) {
		let suppressChange = false;
		if(this.props.onChange)
			suppressChange = this.props.onChange.call(this, option, index) === false;

		if(!suppressChange) {
			this.setValue(option.value);
		}

		this.closeDropdown();
		this.clearSearchTerm();
	}

	openDropdown(){
		if(!this.state.open)
			this.setState({ open: true });
	}

	closeDropdown(){
		if(this.state.open)
			this.setState({ open: false });
	}

	toggleDropdown() {
		this.setState({ open: !this.state.open });
	}

	clearSearchTerm() {
		this.setState({
			searchTerm: '',
			filteredOptions: this.filterOptions(this.state.options, '')
		});
	}

	setValue(value) {
		if(this.state.value !== value)
			this.setState({ value });
	}

	updateFilterSettings({filter, match, options}) {
		this.optionFilter = filter || filters[match];
	    this.setState({filteredOptions: this.filterOptions(options)});
	}

	filterOptions(options = this.props.options, searchTerm = this.state.searchTerm) {		
		if(searchTerm.length === 0)
			return options;

		const filter = this.optionFilter.call(this, searchTerm);
		return options.filter(filter.bind(this));
	}

	getSelectedOption() {
		const value = this.state.value;
		return 	value
				? 	this.props.options.find(option => option.value === value)
				: 	undefined;
	}
}

const NumberOrString = React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]);

ReactSearchDropdown.propTypes = {
	options: React.PropTypes.arrayOf(
		React.PropTypes.shape({
			key: React.PropTypes.any.isRequired,
			label: React.PropTypes.node,
			value: React.PropTypes.any.isRequired
		})
	).isRequired,
	defaultText: React.PropTypes.string.isRequired,	
	value: React.PropTypes.any,
	onChange: React.PropTypes.func,
	filter: React.PropTypes.func,
	match: React.PropTypes.oneOf(['label', 'value', 'both']),
	rowRenderer: React.PropTypes.func,
	/*useVirtualList: React.PropTypes.bool,	
	listWidth: NumberOrString,
	listHeight: NumberOrString,
	itemHeight: NumberOrString*/
};

ReactSearchDropdown.defaultProps = {
	match: 'both'/*,
	useVirtualList: true*/
};

export default ReactSearchDropdown;