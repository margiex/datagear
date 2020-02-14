/*
 * Copyright 2018 datagear.tech. All Rights Reserved.
 */

/**
 * 图表工具集：window.chartUtil。
 * 
 * 依赖:
 * jquery.js
 * chartUtil.echarts依赖echarts.js
 */
(function(window)
{
	var util = (window.chartUtil || (window.chartUtil = {}));
	util.echarts = (util.echarts || {});
	
	/**
	 * 获取图表主题。
	 * 
	 * @param chart
	 * @return {...}
	 */
	util.chartTheme = function(chart)
	{
		return this.renderContextAttr(chart, "chartTheme");
	};
	
	/**
	 * 获取渲染风格。
	 * 
	 * @param chart
	 * @return "..."
	 */
	util.chartRenderStyle = function(chart)
	{
		return this.renderContextAttr(chart, "renderStyle");
	};
	
	/**
	 * 获取通过图表元素的"dg-chart-options"属性值、或者图表元素的"> .dg-chart-options"子元素内容定义的JSON图表设置项。
	 * 
	 * @param chart
	 * @return {...}
	 */
	util.chartElementOptions = function(chart)
	{
		var $ele = $("#"+chart.elementId);
		
		if(!$ele.length)
			return {};
		
		//元素属性
		var optionsStr = $ele.attr("dg-chart-options");
		
		//子元素
		if(!optionsStr)
			optionsStr = $("> .dg-chart-options", $ele).text();
		
		if(!optionsStr)
			return {};
		
		optionsStr = this.trimJSONString(optionsStr);
		
		try
		{
			if(typeof $ != "undefined" && $.parseJSON)
				return $.parseJSON(optionsStr);
			else
				return JSON.parse(optionsStr);
		}
		catch(e)
		{
			this.handleError(e);
		}
		
		return {};
	};
	
	/**
	 * 获取/设置图表的"name"属性值。
	 * 
	 * @param chart
	 * @param value 可选，要设置的属性值
	 */
	util.propertyValueName = function(chart, value)
	{
		return this.propertyValue(chart, "name", value);
	};

	/**
	 * 获取/设置图表的"updateInterval"属性值。
	 * 
	 * @param chart
	 * @param value 可选，要设置的属性值
	 */
	util.propertyValueUpdateInterval = function(chart, value)
	{
		return this.propertyValue(chart, "updateInterval", value);
	};
	
	/**
	 * 获取/设置图表属性值。
	 * 
	 * @param chart
	 * @param name
	 * @param value 可选，要设置的属性值
	 */
	util.propertyValue = function(chart, name, value)
	{
		if(!chart.propertyValues)
			chart.propertyValues = {};
		
		if(value == undefined)
			return chart.propertyValues[name];
		else
			chart.propertyValues[name] = value;
	};
	
	/**
	 * 获取/设置图表渲染上下文的属性值。
	 * 
	 * @param chart
	 * @param attrName
	 * @param attrValue 可选，要设置的属性值
	 */
	util.renderContextAttr = function(chart, attrName, attrValue)
	{
		var renderContext = chart.renderContext;
		
		if(attrValue == undefined)
			return renderContext.attributes[attrName];
		else
			return renderContext.attributes[attrName] = attrValue;
	};
	
	/**
	 * 获取第一个图表数据集对象。
	 * 
	 * @param chart
	 * @return {dataSet: [], propertySigns: {...}}
	 */
	util.firstChartDataSet = function(chart)
	{
		if(!chart || !chart.chartDataSets || chart.chartDataSets.length < 1)
			return {};
			
		return chart.chartDataSets[0];
	};
	
	/**
	 * 获取图表数据集对象数组。
	 */
	util.chartDataSets = function(chart)
	{
		if(!chart || !chart.chartDataSets || chart.chartDataSets.length < 1)
			return [];
			
		return chart.chartDataSets;
	};
	
	/**
	 * 获取图表名称。
	 * 
	 * @param chartDataSet 图表数据集对象
	 */
	util.dataSetName = function(chartDataSet)
	{
		var dataSet = (chartDataSet.dataSet || chartDataSet);
		var name = (dataSet ? dataSet.name : "");
		
		return (name ? name : "");
	};
	
	/**
	 * 获取指定标记的第一个数据集属性，没有则返回null。
	 * 
	 * @param chartDataSet 图表数据集对象
	 * @param dataSign 数据标记对象、标记名称
	 */
	util.dataSetPropertyOfSign = function(chartDataSet, dataSign)
	{
		var properties = this.dataSetPropertiesOfSign(chartDataSet, dataSign);
		
		return (properties.length > 0 ? properties[0] : null);
	};
	
	/**
	 * 获取指定标记的数据集属性数组。
	 * 
	 * @param chartDataSet 图表数据集对象
	 * @param dataSign 数据标记对象、标记名称
	 */
	util.dataSetPropertiesOfSign = function(chartDataSet, dataSign)
	{
		var re = [];
		
		if(!chartDataSet || !chartDataSet.dataSet || !dataSign)
			return re;
		
		dataSign = (dataSign.name || dataSign);
		var dataSetProperties = (chartDataSet.dataSet.properties || []);
		var propertySigns = (chartDataSet.propertySigns || {});
		
		var signPropertyNames = [];
		
		for(var pname in propertySigns)
		{
			var mySigns = (propertySigns[pname] || []);
			
			for(var i=0; i<mySigns.length; i++)
			{
				if(mySigns[i] == dataSign || mySigns[i].name == dataSign)
				{
					signPropertyNames.push(pname);
					break;
				}
			}
		}
		
		for(var i=0; i<dataSetProperties.length; i++)
		{
			for(var j=0; j<signPropertyNames.length; j++)
			{
				if(dataSetProperties[i].name == signPropertyNames[j])
					re.push(dataSetProperties[i]);
			}
		}
		
		return re;
	};
	
	/**
	 * 获取数据集属性标签，没有则返回空字符串。
	 * 
	 * @param dataSetProperty
	 */
	util.dataSetPropertyLabel = function(dataSetProperty)
	{
		var label = (dataSetProperty ? dataSetProperty.label : null);
		
		if(!label && dataSetProperty)
			label = dataSetProperty.name;
		
		if(!label)
			label = "";
		
		return label;
	};

	/**
	 * 返回第一个数据集结果。
	 */
	util.resultFirst = function(dataSetResults)
	{
		if(!dataSetResults || dataSetResults.length < 1)
			return {};
		
		return dataSetResults[0];
	};
	
	util.resultIndex = function(dataSetResults, index)
	{
		if(!dataSetResults || !dataSetResults.length || dataSetResults.length < index)
			return {};
			
		return dataSetResults[index];
	};
	
	/**
	 * 获取数据集结果指定属性、指定行的单元格值。
	 * 
	 * @param result 数据集结果对象、对象数组
	 * @param property 数据集属性对象、属性名
	 * @param row 行索引，以0开始，默认为0
	 */
	util.resultCell = function(result, property, row)
	{
		if(row == null)
			row = 0;
		
		var re = this.resultRowArrays(result, property, row+1);
		
		return (re.length > row ? re[row] : undefined);
	};
	
	/**
	 * 将数据集结果的行对象按照指定properties顺序转换为行值数组。
	 * 
	 * @param result 数据集结果对象、对象数组
	 * @param properties 数据集属性对象数组、属性名数组、属性对象、属性名
	 * @param count 获取的最多行数，可选，默认为全部
	 * @return properties为数组时：[[..., ...], ...]；properties非数组时：[..., ...]
	 */
	util.resultRowArrays = function(result, properties, count)
	{
		var re = [];
		
		if(properties == null)
			return re;
		
		var datas = (result.length != null ? result : (result.datas || []));
		
		var getCount = datas.length;
		if(count != null && count < getCount)
			getCount = count;
		
		if(properties.length > 0)
		{
			for(var i=0; i< getCount; i++)
			{
				var rowObj = datas[i];
				var row = [];
				
				for(var j=0; j<properties.length; j++)
				{
					var p = properties[j];
					
					var name = (p ? (p.name || p) : undefined);
					if(!name)
						continue;
					
					row[j] = rowObj[name];
				}
				
				re[i] = row;
			}
		}
		else
		{
			var name = (properties ? (properties.name || properties) : undefined);
			
			if(name)
			{
				for(var i=0; i< getCount; i++)
				{
					var rowObj = datas[i];
					re[i] = rowObj[name];
				}
			}
		}
		
		return re;
	};
	
	/**
	 * 将数据集结果的行对象按照指定properties顺序转换为列值数组。
	 * 
	 * @param result 数据集结果对象、对象数组
	 * @param properties 数据集属性对象数组、属性名数组、属性对象、属性名
	 * @param count 获取的最多行数，可选，默认为全部
	 * @return properties为数组时：[[..., ...], ...]；properties非数组时：[..., ...]
	 */
	util.resultColumnArrays = function(result, properties, count)
	{
		var re = [];
		
		if(properties == null)
			return re;
		
		var datas = (result.length != null ? result : (result.datas || []));
		
		var getCount = datas.length;
		if(count != null && count < getCount)
			getCount = count;
		
		if(properties.length > 0)
		{
			for(var i=0; i<properties.length; i++)
			{
				var p = properties[i];
				
				var name = (p ? (p.name || p) : undefined);
				if(!name)
					continue;
				
				var column = [];
				
				for(var j=0; j< getCount; j++)
					column[j] = datas[j][name];
				
				re[i] = column;
			}
		}
		else
		{
			var name = (properties ? (properties.name || properties) : undefined);

			if(name)
			{
				for(var i=0; i< getCount; i++)
				{
					var rowObj = datas[i];
					re[i] = rowObj[name];
				}
			}
		}
		
		return re;
	};
	
	/**
	 * 获取数据集结果的名称/值对象数组。
	 * 
	 * @param result 数据集结果对象、对象数组
	 * @param nameProperty 名称属性对象、属性名
	 * @param valueProperty 值属性对象、属性名
	 * @param count 获取结果数据的最多行数，可选，默认为全部
	 * @return [{name: ..., value: ...}, ...]
	 */
	util.resultNameValueObjects = function(result, nameProperty, valueProperty, count)
	{
		var re = [];
		
		var datas = (result.length != null ? result : (result.datas || []));
		
		var getCount = datas.length;
		if(count != null && count < getCount)
			getCount = count;
		
		nameProperty = (nameProperty.name || nameProperty);
		valueProperty = (valueProperty.name || valueProperty);
		
		for(var i=0; i< getCount; i++)
		{
			var obj =
			{
				"name" : datas[i][nameProperty],
				"value" : datas[i][valueProperty]
			};
			
			re[i] = obj;
		}
		
		return re;
	};
	
	/**
	 * 将不符合JSON规范的字符串定义规范化：属性名添加双引号、或将属性名单引号替换为双引号。
	 */
	util.trimJSONString = function(str)
	{
		if(!str)
			return str;
		
		//替换单引号为双引号
		var str1 = "";
		for(var i=0; i<str.length;i++)
		{
			var c = str.charAt(i);
			
			if(c == '\\')
			{
				str1 += c;
				i = i+1;
				str1 += str.charAt(i);
			}
			else if(c == '\'')
				str1 += '"';
			else
				str1 += c;
		}
		
		str = str1;
		
		//属性名匹配表达式
		var reg = /([{,]\s*)([^\:\s]*)(\s*:)/g;
		
		return str.replace(reg, function(token, prefix, name, suffix)
		{
			var len = name.length;
			
			if(len > 1 && name.charAt(0) == '"' && name.charAt(len-1) == '"')
				return token;
			else if(len > 1 && name.charAt(0) == '\'' && name.charAt(len-1) == '\'')
			{
				name = '"' + name.substring(1, len-1) + '"';
				return prefix + name + suffix;
			}
			else
				return prefix + '"' + name + '"' + suffix;
		});
	};
	
	util.handleError = function(e)
	{
		if(typeof console != "undefined")
		{
			if(console.error)
				console.error(e);
			else if(console.warn)
				console.warn(e);
			else if(console.info)
				console.info(e);
		}
	};
	
	/**
	 * 初始化Echarts对象。
	 * 
	 * @param chart 图表对象
	 * @param echartsOption Echarts设置项
	 */
	util.echarts.init = function(chart, echartsOption)
	{
		var echartsObj = echarts.init(document.getElementById(chart.elementId), this.theme(chart));
		
		if(echartsOption != null)
			echartsObj.setOption(echartsOption);
		
		return echartsObj;
	};
	
	/**
	 * 获取echarts主题，如果没有，则自动注册。
	 * 
	 * @param dashboard
	 */
	util.echarts.theme = function(chart)
	{
		var renderStyle = util.chartRenderStyle(chart);
		var chartTheme = util.chartTheme(chart);
		
		if(!renderStyle || !chartTheme)
			return "";
		
		if(this._REGISTERED_THEME)
			return renderStyle;
		
		this._REGISTERED_THEME = true;
		
		var theme = this.buildTheme(renderStyle, chartTheme);
		this.registerTheme(renderStyle, theme);
	    
	    return renderStyle;
	};
	
	/**
	 * 注册echarts主题。
	 * 
	 * @param name 主题名称
	 * @param theme 主题对象
	 */
	util.echarts.registerTheme = function(name, theme)
	{
		echarts.registerTheme(name, theme);
	};
	
	/**
	 * 构建echarts主题。
	 * 
	 * @param renderStyle 当前渲染风格
	 * @param chartTheme 图表主题
	 */
	util.echarts.buildTheme = function(renderStyle, chartTheme)
	{
		var theme =
		{
			"color" : chartTheme.graphColors,
			"backgroundColor" : chartTheme.backgroundColor,
			"textStyle" : {},
			"title" : {
		        left: "center",
				"textStyle" : {
					"color" : chartTheme.color
				},
				"subtextStyle" : {
					"color" : chartTheme.colorSecond
				}
			},
			"line" : {
				"itemStyle" : {
					"normal" : {
						"borderWidth" : 1
					}
				},
				"lineStyle" : {
					"normal" : {
						"width" : 2
					}
				},
				"symbolSize" : 4,
				"symbol" : "circle",
				"smooth" : false
			},
			"radar" : {
				"name" : { "textStyle" : { "color" : chartTheme.color } },
				"axisLine" : { "lineStyle" : { "color" : chartTheme.colorFourth } },
				"splitLine" : { "lineStyle" : { "color" : chartTheme.colorFourth } },
				"splitArea" : { "areaStyle" : { "color" : [ chartTheme.colorFifth, chartTheme.backgroundColor ] } },
				"itemStyle" : {
					"normal" : {
						"borderWidth" : 1
					}
				},
				"lineStyle" : {
					"normal" : {
						"width" : 2
					}
				},
				"symbolSize" : 4,
				"symbol" : "circle",
				"smooth" : false
			},
			"bar" : {
				"itemStyle" : {
					"normal" : {
						"barBorderWidth" : 0,
						"barBorderColor" : chartTheme.colorFourth
					},
					"emphasis" : {
						"barBorderWidth" : 0,
						"barBorderColor" : chartTheme.colorFourth
					}
				}
			},
			"pie" : {
				"itemStyle" : {
					"normal" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					},
					"emphasis" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					}
				}
			},
			"scatter" : {
				"itemStyle" : {
					"normal" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					},
					"emphasis" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					}
				}
			},
			"boxplot" : {
				"itemStyle" : {
					"normal" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					},
					"emphasis" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					}
				}
			},
			"parallel" : {
				"itemStyle" : {
					"normal" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					},
					"emphasis" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					}
				}
			},
			"sankey" : {
				"itemStyle" : {
					"normal" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					},
					"emphasis" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					}
				}
			},
			"funnel" : {
				"label" : { "color" : chartTheme.color },
				"itemStyle" : {
					"borderColor" : chartTheme.colorFourth,
					"borderWidth" : 0,
					"normal" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					},
					"emphasis" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					}
				}
			},
			"gauge" : {
				"title" : { color : chartTheme.color },
				"itemStyle" : {
					"normal" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					},
					"emphasis" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorFourth
					}
				}
			},
			"candlestick" : {
				"itemStyle" : {
					"normal" : {
						"color" : chartTheme.graphColors[0],
						"color0" : chartTheme.graphColors[1],
						"borderColor" : chartTheme.colorThird,
						"borderColor0" : chartTheme.colorFourth,
						"borderWidth" : 1
					}
				}
			},
			"graph" : {
				"itemStyle" : {
					"normal" : {
						"borderWidth" : 0,
						"borderColor" : chartTheme.colorThird
					}
				},
				"lineStyle" : {
					"normal" : {
						"width" : 1,
						"color" : chartTheme.colorFourth
					}
				},
				"symbolSize" : 4,
				"symbol" : "circle",
				"smooth" : false,
				"color" : chartTheme.graphColors,
				"label" : {
					"normal" : {
						"textStyle" : {
							"color" : chartTheme.colorSecond
						}
					}
				}
			},
			"map" : {
				"itemStyle" : {
					"normal" : {
						"areaColor" : chartTheme.colorThird,
						"borderColor" : chartTheme.colorFourth,
						"borderWidth" : 0.5
					},
					"emphasis" : {
						"areaColor" : chartTheme.highlightTheme.backgroundColor,
						"borderColor" : chartTheme.highlightTheme.borderColor,
						"borderWidth" : 1
					}
				},
				"label" : {
					"normal" : {
						"textStyle" : {
							"color" : chartTheme.colorSecond
						}
					},
					"emphasis" : {
						"textStyle" : {
							"color" : chartTheme.colorThird
						}
					}
				}
			},
			"geo" : {
				"itemStyle" : {
					"normal" : {
						"areaColor" : chartTheme.colorThird,
						"borderColor" : chartTheme.colorFourth,
						"borderWidth" : 0.5
					},
					"emphasis" : {
						"areaColor" : chartTheme.highlightTheme.backgroundColor,
						"borderColor" : chartTheme.highlightTheme.borderColor,
						"borderWidth" : 1
					}
				},
				"label" : {
					"normal" : {
						"textStyle" : {
							"color" : chartTheme.colorSecond
						}
					},
					"emphasis" : {
						"textStyle" : {
							"color" : chartTheme.colorThird
						}
					}
				}
			},
			"categoryAxis" : {
				"axisLine" : {
					"show" : true,
					"lineStyle" : {
						"color" : chartTheme.colorSecond
					}
				},
				"axisTick" : {
					"show" : true,
					"lineStyle" : {
						"color" : chartTheme.colorThird
					}
				},
				"axisLabel" : {
					"show" : true,
					"textStyle" : {
						"color" : chartTheme.colorSecond
					}
				},
				"splitLine" : {
					"show" : true,
					"lineStyle" : {
						"color" : [ chartTheme.colorFourth ]
					}
				},
				"splitArea" : {
					"show" : false,
					"areaStyle" : {
						"color" : [ chartTheme.colorFourth ]
					}
				}
			},
			"valueAxis" : {
				"axisLine" : {
					"show" : true,
					"lineStyle" : {
						"color" : chartTheme.colorSecond
					}
				},
				"axisTick" : {
					"show" : true,
					"lineStyle" : {
						"color" : chartTheme.colorFourth
					}
				},
				"axisLabel" : {
					"show" : true,
					"textStyle" : {
						"color" : chartTheme.colorSecond
					}
				},
				"splitLine" : {
					"show" : true,
					"lineStyle" : {
						"color" : [ chartTheme.colorFourth ]
					}
				},
				"splitArea" : {
					"show" : false,
					"areaStyle" : {
						"color" : [ chartTheme.colorFourth ]
					}
				}
			},
			"logAxis" : {
				"axisLine" : {
					"show" : true,
					"lineStyle" : {
						"color" : chartTheme.colorThird
					}
				},
				"axisTick" : {
					"show" : true,
					"lineStyle" : {
						"color" : chartTheme.colorThird
					}
				},
				"axisLabel" : {
					"show" : true,
					"textStyle" : {
						"color" : chartTheme.colorThird
					}
				},
				"splitLine" : {
					"show" : true,
					"lineStyle" : {
						"color" : [ chartTheme.colorFourth ]
					}
				},
				"splitArea" : {
					"show" : false,
					"areaStyle" : {
						"color" : [ chartTheme.colorThird ]
					}
				}
			},
			"timeAxis" : {
				"axisLine" : {
					"show" : true,
					"lineStyle" : {
						"color" : chartTheme.colorThird
					}
				},
				"axisTick" : {
					"show" : true,
					"lineStyle" : {
						"color" : chartTheme.colorThird
					}
				},
				"axisLabel" : {
					"show" : true,
					"textStyle" : {
						"color" : chartTheme.colorThird
					}
				},
				"splitLine" : {
					"show" : true,
					"lineStyle" : {
						"color" : [ chartTheme.colorFourth ]
					}
				},
				"splitArea" : {
					"show" : false,
					"areaStyle" : {
						"color" : [ chartTheme.colorThird ]
					}
				}
			},
			"toolbox" : {
				"iconStyle" : {
					"normal" : {
						"borderColor" : chartTheme.colorFourth
					},
					"emphasis" : {
						"borderColor" : chartTheme.colorThird
					}
				}
			},
			"grid":
			{
				"left": 30,
				"right": 46,
				"top": 80,
				"bottom": 20,
				"containLabel": true
			},
			"legend" : {
				"orient": "horizontal",
				"top": 25,
				"textStyle" : {
					"color" : chartTheme.colorSecond
				},
				"inactiveColor" : chartTheme.colorThird
			},
			"tooltip" : {
				"backgroundColor" : chartTheme.tooltipTheme.backgroundColor,
				"textStyle" : { color: chartTheme.tooltipTheme.color },
				"axisPointer" : {
					"lineStyle" : {
						"color" : chartTheme.colorSecond,
						"width" : "1"
					},
					"crossStyle" : {
						"color" : chartTheme.colorSecond,
						"width" : "1"
					}
				}
			},
			"timeline" : {
				"lineStyle" : {
					"color" : chartTheme.colorThird,
					"width" : 1
				},
				"itemStyle" : {
					"normal" : {
						"color" : chartTheme.colorThird,
						"borderWidth" : 1
					},
					"emphasis" : {
						"color" : chartTheme.colorSecond
					}
				},
				"controlStyle" : {
					"normal" : {
						"color" : chartTheme.colorThird,
						"borderColor" : chartTheme.colorThird,
						"borderWidth" : 0.5
					},
					"emphasis" : {
						"color" : chartTheme.colorThird,
						"borderColor" : chartTheme.colorThird,
						"borderWidth" : 0.5
					}
				},
				"checkpointStyle" : {
					"color" : chartTheme.highlightTheme.backgroundColor,
					"borderColor" : chartTheme.highlightTheme.borderColor
				},
				"label" : {
					"normal" : {
						"textStyle" : {
							"color" : chartTheme.colorThird
						}
					},
					"emphasis" : {
						"textStyle" : {
							"color" : chartTheme.colorThird
						}
					}
				}
			},
			"visualMap" : {
				"color" : chartTheme.graphColors
			},
			"dataZoom" : {
				"backgroundColor" : chartTheme.backgroundColor,
				"dataBackgroundColor" : chartTheme.colorFourth,
				"fillerColor" : chartTheme.colorThird,
				"handleColor" : chartTheme.colorThird,
				"handleSize" : "100%",
				"textStyle" : {
					"color" : chartTheme.colorThird
				}
			},
			"markPoint" : {
				"label" : {
					"normal" : {
						"textStyle" : {
							"color" : chartTheme.colorThird
						}
					},
					"emphasis" : {
						"textStyle" : {
							"color" : chartTheme.colorThird
						}
					}
				}
			}
		};
		
		return theme;
	};
})
(window);