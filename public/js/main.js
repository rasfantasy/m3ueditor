
// https://raw.githubusercontent.com/Dimonovich/TV/Dimonovich/FREE/TV
// #EXTM3U url-tvg="http://epg.one/epg2.xml.gz,https://iptvx.one/EPG.gz"

$(document).ready(function () {
	let chanelsList;
	let groups = [];
	let addedList = "";

	function getChanels() {
		$.ajax({
			url: 'https://raw.githubusercontent.com/Dimonovich/TV/Dimonovich/FREE/TV',
			method: 'get',   
			dataType: 'text',
			success: function (data) {
				chanelsList = parseChanels(data);
				renderChanels();
			}
		});
	}

	function parseChanels(data) {
		let chanelsObj = [];
		let counterEXTINF = 0;
		let counterURL = 0;
		let counterENDURL = 0;
		let counterENDEXTIF = 0;
		while (counterEXTINF >= 0) {
			let chanelTemp;
			counterEXTINF = data.indexOf("#EXTINF:", counterEXTINF + 8);
			counterENDEXTIF = data.indexOf("\n", counterEXTINF);
			counterURL = data.indexOf("htt", counterENDEXTIF);
			counterENDURL = data.indexOf("\n", counterURL);
			if (data.indexOf("#EXTVLCOPT", counterEXTINF) > counterEXTINF && data.indexOf("#EXTVLCOPT", counterEXTINF) < counterENDURL + 30) {
				counterENDURL = data.indexOf("\n", counterENDURL + 1);
				chanelTemp = data.slice(counterEXTINF, counterENDURL);
			} else {
				chanelTemp = data.slice(counterEXTINF, counterENDURL);
			}
			//chanel title 
			let ct = chanelTemp.indexOf("group-title=");
			let cte = chanelTemp.indexOf('"', ct + 15);
			//chanel tv logo
			let cl = 0;
			let cle = 0;
			if (chanelTemp.indexOf("tvg-logo=") != -1) {
				cl = chanelTemp.indexOf("tvg-logo=");
				cle = chanelTemp.indexOf('"', cl + 11);
			}
			//chanel name
			let cn = chanelTemp.indexOf(",");
			let cne = 0;
			if (chanelTemp.indexOf("#EXTVLCOPT") != -1) {
				cne = chanelTemp.indexOf("#EXTVLCOPT", cn);
			} else {
				cne = chanelTemp.indexOf("htt", cn);
			}
			//chanel url
			let cu = chanelTemp.indexOf("," + 1);
			let cue = chanelTemp.indexOf("\n", cu);
			if (chanelTemp.indexOf("#EXTVLCOPT", cue) != -1) {
				cue = chanelTemp.indexOf("#EXTVLCOPT", cu);
				cue = chanelTemp.indexOf("\n", cue);
			} else {
				cue = chanelTemp.indexOf("htt", cn);
			}

			let objTemp = {
				"chanel-title": chanelTemp.slice(ct + 13, cte),
				"chanel-name": chanelTemp.slice(cn + 1, cne),
				"chanel-url": chanelTemp.slice(cue, chanelTemp.length),
				"chanel-source": chanelTemp
			}

			if (cl != 0 && cle != 0) {
				Object.assign(objTemp, { "chanel-logo": chanelTemp.slice(cl + 10, cle) });
			}
			chanelsObj.push(objTemp);
		}
		return chanelsObj;
	}

	//chanel-title
	//chanel-name
	//chanel-url
	//chanel-source
	//chanel-logo
	function renderChanels() {
		let container = $(".chanelsList");
		for (let i = 0; i < chanelsList.length; i++) {
			let checkGroup = groups.findIndex(x => x[0].title === chanelsList[i]['chanel-title']);
			if (checkGroup == -1) {
				groups.push([
					{
						"title": chanelsList[i]['chanel-title']
					}, []]);
			}
		}

		for (let i = 0; i < chanelsList.length; i++) {
			let checkGroup = groups.findIndex(x => x[0].title === chanelsList[i]['chanel-title']);
			groups[checkGroup][1].push(chanelsList[i]);
		}

		let html = "";
		for (let i = 0; i < groups.length - 1; i++) {
			html += `
			<div class="card container-fluid">
				<div class="card-header" id="heading${i}">
			  		<h5 class="mb-0">
						<button class="btn btn-link" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
				  			${groups[i][0]['title']}
						</button>
			  		</h5>
				</div>
				<div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">
					<div class="card-body row d-flex justify-content-center">
			`;
			for (let j = 0; j < groups[i][1].length; j++) {
				logoURL = groups[i][1][j]['chanel-logo'];
				if (logoURL == undefined) {
					logoURL = "public/img/imgerror.webp";
				}
				html += `
						<div class="card m-1"" style="width: 250px;">
							<img style="min-width: 128px; min-height: 128px; max-width:128px; max-height:128px; object-fit: cover; margin: 0 auto;" class="card-img-top" src="${logoURL}" alt="asd">
							<div class="card-body">
								<h5 class="card-title">${groups[i][1][j]['chanel-name']}</h5>
							</div>
							<div class="card-body">
								<div class="form-check">
									<input class="form-check-input chanelCheck" data-source="${i}_${j}" type="checkbox" value="${i}_${j}" id="Check${i}_${j}">
									<label class="form-check-label" for="Check${i}_${j}">
										Добавить в список
									</label>
								</div>
								
							</div>
						</div>	
				`;
			}
			html += "</div></div></div>";
		}
		container.append(html);
		addedList = getCookie("chanelsList");
		checkChanelsWithLoad();
		renderChanelsAdded();
	}

	function checkChanelsWithLoad() {
		let chanelsArray = addedList.split("|");
		for (let x = 0; x < chanelsArray.length - 1; x++) {
			let index = chanelsArray[x].split("_");
			let i = index[0];
			let j = index[1];
			$('.chanelsList').find(`input[data-source='${i}_${j}']`).prop('checked', true);
		}
	}

	function setCookie(cname, cvalue, exdays) {
		const d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		let expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}

	function getCookie(cname) {
		let name = cname + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

	function createFile() {
		let chanelsArray = addedList.split("|");
		let fileText = `#EXTM3U url-tvg="http://epg.one/epg2.xml.gz,https://iptvx.one/EPG.gz"\r\n`;
		for (let x = 0; x < chanelsArray.length - 1; x++) {
			let index = chanelsArray[x].split("_");
			let i = index[0];
			let j = index[1];
			fileText += groups[i][1][j]['chanel-source'] + "\r\n";
		}
		return fileText;
	}

	function download(filename, text) {
		var pom = document.createElement('a');
		pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		pom.setAttribute('download', filename);
		if (document.createEvent) {
			var event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			pom.dispatchEvent(event);
		}
		else {
			pom.click();
		}
	}

	function addChanel(data) {
		addedList += data + "|";
		renderChanelsAdded();
	}

	function delChanel(data) {
		addedList = addedList.replace(data + "|", "");
		renderChanelsAdded();
	}

	function renderChanelsAdded() {
		let chanelsArray = addedList.split("|");
		let html = "";
		for (let x = 0; x < chanelsArray.length - 1; x++) {
			let index = chanelsArray[x].split("_");
			let i = index[0];
			let j = index[1];
			logoURL = groups[i][1][j]['chanel-logo'];
			if (logoURL == undefined) {
				logoURL = "https://static-00.iconduck.com/assets.00/no-image-icon-256x256-blc2175p.png";
			}
			html += `
			<div class="alert alert-warning alert-dismissible fade show" role="alert">
				<img style="min-width: 32px; min-height: 32px; max-width:32px; max-height:32px; object-fit: cover; margin: 0 auto;" class="card-img-top" src="${logoURL}" alt="asd"> 
				<strong>${groups[i][1][j]['chanel-name']}</strong> (${groups[i][1][j]['chanel-title']})
				<button type="button" class="close" data-source="${i}_${j}" data-dismiss="alert" aria-label="Close">
			  		<span aria-hidden="true">&times;</span>
				</button>
		  	</div>
			`;
		}
		$('.chanelAdded').html(html);
	}

	// Events elements 
	$('.chanelsList').on('click', 'input[type=checkbox]', function () {
		if ($(this).is(':checked')) {
			addChanel($(this).attr("data-source"));
		}
		else {
			delChanel($(this).attr("data-source"));
		}
	});

	$('.chanelAdded').on('click', 'button', function () {
		$('.chanelsList').find(`input[data-source='${$(this).attr("data-source")}']`).prop('checked', false);
		delChanel($(this).attr("data-source"));
	});

	$('#clearallchanels').click(function () {
		addedList = "";
		$('.chanelsList').find("input[type=checkbox]").prop('checked', false);
		renderChanelsAdded();
	});

	$('#savechanels').click(function () {
		if (addedList.length >= 2) {
			setCookie("chanelsList", addedList, 180);
			$(this).tooltip('hide');
			download('chanels.m3u', createFile());
		} else {
			$(this).tooltip('show');
		}
	});

	//automatical run with load web page
	getChanels();
});

