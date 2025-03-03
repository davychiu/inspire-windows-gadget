////////////////////////////////////////////////////////////////////////////////
//
// THIS CODE IS NOT APPROVED FOR USE IN/ON ANY OTHER UI ELEMENT OR PRODUCT COMPONENT.
// Copyright (c) 2009 Microsoft Corporation. All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
var REFRESH_INTERVAL = 3000;

var dialOffset = -125;

var intCPUDialPos = dialOffset;
var intMEMDialPos = dialOffset;

var intCPUCurrent = dialOffset;
var intMEMCurrent = dialOffset;

var intNoAnimThresh = 4;

var isDocked;
var isVisible = true;

var cpuPercentageText;
var memoryPercentageText;

var gadgetTimeout;
var dialTimeout;

var L_PROCESSOR_TEXT = "CPU 使用率";
var L_MEMORY_TEXT	= "ランダム アクセス メモリ (RAM)";

////////////////////////////////////////////////////////////////////////////////
//
// GADGET FUNCTIONS
//
////////////////////////////////////////////////////////////////////////////////
function loadMain()
{
	System.Gadget.visibilityChanged = checkVisibility;
	System.Gadget.onUndock = checkState;
	System.Gadget.onDock = checkState;
	
	cpuPercentageText = document.getElementById("cpuBackground");
	memoryPercentageText = document.getElementById("memoryBackground");

	cpuMeter.addShadow("grey", 2, 40, 2, 2);
	memMeter.addShadow("grey", 2, 40, 2, 2);
	checkState();
	updateGadgetDials();
}
////////////////////////////////////////////////////////////////////////////////
//
// start gadget animation
//
////////////////////////////////////////////////////////////////////////////////
function updateGadgetDials()
{
	clearTimeout(dialTimeout);
	
	var cpuUpdated = false;
	var memoryUpdated = false;

	var oMachine = new machineStatus();
	
	if (Math.round(intCPUCurrent) != Math.round(oMachine.CPUUsagePercentage))
	{
		intCPUCurrent = oMachine.CPUUsagePercentage;
		writeMeter(0, numberFormat(oMachine.CPUUsagePercentage) + "%");
		
		cpuUpdated = true;
	}
	
	if (Math.round(intMEMCurrent) != Math.round(oMachine.memoryPercentage))
	{
		intMEMCurrent = oMachine.memoryPercentage;
		writeMeter(1, numberFormat(oMachine.memoryPercentage) + "%");
		
		memoryUpdated = true;
	}
	
	if (cpuUpdated || memoryUpdated)
	{
		moveDial(cpuUpdated, (oMachine.CPUUsagePercentage - intCPUDialPos), memoryUpdated, (oMachine.memoryPercentage - intMEMDialPos) );
	}
	
	gadgetTimeout = setTimeout("updateGadgetDials()", REFRESH_INTERVAL);
}
////////////////////////////////////////////////////////////////////////////////
//
// update machine status statistics
//
////////////////////////////////////////////////////////////////////////////////
function machineStatus()
{
	this.CPUCount = System.Machine.CPUs.count;

	var usageTotal = 0;
	
	for (var i = 0; i < this.CPUCount; i++)
	{
		usageTotal += System.Machine.CPUs.item(i).usagePercentage;
	}

	this.CPUUsagePercentage = Math.min(Math.max(0, usageTotal / this.CPUCount), 100);
	this.totalMemory = System.Machine.totalMemory;
	this.availableMemory = System.Machine.availableMemory;
	
	if((this.totalMemory > 0) && (this.totalMemory > this.availableMemory))
	{
		this.memoryPercentage = Math.min(100 - (this.availableMemory / this.totalMemory * 100), 100);
	}
	else
	{
		this.memoryPercentage = 0;
	}
}
////////////////////////////////////////////////////////////////////////////////
//
// write meter reading
//
////////////////////////////////////////////////////////////////////////////////
function writeMeter(dialType, percent)
{
	if (dialType == 0)
	{
		cpuPercentageText.style.left = centerPercent(percent, [33,56], [3,3]);
		cpuPercentageText.innerText = percent;
		cpuMeterLabel.innerHTML = L_PROCESSOR_TEXT + " " +percent;
	}
	else if (dialType == 1)
	{
		memoryPercentageText.style.left = centerPercent(percent, [89,133], [3,5]);
		memoryPercentageText.innerText = percent;
		memoryMeterLabel.innerHTML = L_MEMORY_TEXT + " " +percent;
	}		
}
////////////////////////////////////////////////////////////////////////////////
//
// move the cpu dial
//
////////////////////////////////////////////////////////////////////////////////
function moveDial(cpuDial, cpuInc, memoryDial, memoryInc)
{
	if (cpuDial)
	{
		intCPUDialPos += cpuInc;
		
		if (cpuInc > 0)
		{
			intCPUDialPos = Math.min(Math.max(0, intCPUDialPos), intCPUCurrent);
		}
		else
		{
			intCPUDialPos = Math.max(Math.max(0, intCPUCurrent), intCPUDialPos);
		}
		
		cpuMeter.Rotation = (intCPUCurrent * 2.5) + dialOffset;
	}
	
	if (memoryDial)
	{
		intMEMDialPos += memoryInc;

		if (memoryInc > 0)
		{
			intMEMDialPos = Math.min(Math.max(0, intMEMDialPos), intMEMCurrent);
		}
		else
		{
			intMEMDialPos = Math.max(Math.max(0, intMEMCurrent), intMEMDialPos);
		}
		
		memMeter.Rotation = (intMEMCurrent * 2.5) + dialOffset;
	}
	
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function centerPercent(percent, leftPx, adjPx)
{
	var index = 0;
	
	if (!isDocked)
	{
		index = 1;
	}

	var left = leftPx[index];

	if (percent.length > 3)
	{
		left -= adjPx[index];
	}
	
	return left;
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function numberFormat(numberIn)
{
	if (numberIn == null || numberIn < 0.5)
	{
		return "00";
	}
	
	numberIn = Math.round(numberIn);	
	
	if (numberIn != null && numberIn < 10)
	{
		return "0" + numberIn;
	}
	else if (numberIn != null && numberIn > 100)
	{
		return 100;
	}
	else
	{
		return numberIn;
	}
}
////////////////////////////////////////////////////////////////////////////////
//
// styles for gadget when UNDOCKED
//
////////////////////////////////////////////////////////////////////////////////
function undockedState()
{
	with (document.body.style)
	{
		width = "198px";
		height = "159px";
	}
	background.style.width = "198px";
	background.style.height = "159px";
	background.src = "url(images/back_lrg.png)";
	
	with (cpuMeter.style)
	{
		left = "63px";
		top = "34px";
		width = "10px";
		height = "98px";
	}
	cpuMeter.src = "images/dial_lrg.png";
	
	with (memMeter.style)
	{
		left = "137px";
		top = "16px";
		width = "10px";
		height = "70px";
	}
	memMeter.src = "images/dial_lrg_sml.png";
	
	with (dialDot.style)
	{
		width = "198px";
		height = "150px";
	}
	dialDot.src = "images/dialdot_lrg.png";
		
	cpuPercentageText.style.left = 56;
	cpuPercentageText.style.top = 108;
	cpuPercentageText.style.fontSize = 12;
  
	memoryPercentageText.style.left = 133;
	memoryPercentageText.style.top = 66;
	memoryPercentageText.style.fontSize = 12;
	
	glassMap.src = "images/glass_lrg.png";
	glassMap.useMap = "#back_lrg_Map";
	memoryLargeMap.alt = L_MEMORY_TEXT;
	processorLargeMap.alt = L_PROCESSOR_TEXT;

	isDocked = false;
}
////////////////////////////////////////////////////////////////////////////////
//
// styles for gadget when DOCKED
// 
////////////////////////////////////////////////////////////////////////////////
function dockedState()
{
	with (document.body.style)
	{
		width = "130px";
		height = "101px";
	}
	background.style.width = "130px";
	background.style.height = "101px";
	background.src = "url(images/back.png)";
	
	with (cpuMeter.style)
	{
		left = "38px";
		top = "22px";
		width = "8px";
		height = "72px";
	}
	cpuMeter.src = "images/dial.png";
	
	with (memMeter.style)
	{
		left = "92px";
		top = "8px";
		width = "8px";
		height = "50px";
	}
	memMeter.src = "images/dial_sml.png";

	with (dialDot.style)
	{
		width = "130px";
		height = "101px";
	}
	dialDot.src = "images/dialdot.png";
	
	cpuPercentageText.style.left = 33;
	cpuPercentageText.style.top = 76;
	cpuPercentageText.style.fontSize = 10;

	memoryPercentageText.style.left = 89;
	memoryPercentageText.style.top = 43;
	memoryPercentageText.style.fontSize = 10;    
	
	glassMap.src = "images/glass.png";
	glassMap.useMap = "#back_Map";
	memoryMap.alt = L_MEMORY_TEXT;
	processorMap.alt = L_PROCESSOR_TEXT;
	
	isDocked = true;
}
////////////////////////////////////////////////////////////////////////////////
//
// determine if gadget is in sidebar - docked or on the desktop - undocked
//
////////////////////////////////////////////////////////////////////////////////
function checkState()
{
	if (!System.Gadget.docked)
	{
		undockedState();
	}
	else
	{
		dockedState();
	}
	
	writeMeter(0, numberFormat(intCPUCurrent) + "%");
	writeMeter(1, numberFormat(intMEMCurrent) + "%");
}
////////////////////////////////////////////////////////////////////////////////
//
// determine if gadget is visible
//
////////////////////////////////////////////////////////////////////////////////
function checkVisibility()
{
	isVisible = System.Gadget.visible;
	clearTimeout(gadgetTimeout);
	
	if (isVisible)
	{
		gadgetTimeout = setTimeout("updateGadgetDials()", REFRESH_INTERVAL);
	}
}
