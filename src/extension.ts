import * as vscode from 'vscode';
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyCBh8JtzqpEfH2msUlebs6-X6ZwJ-o89gc",
	authDomain: "melody-87a48.firebaseapp.com",
	projectId: "melody-87a48",
	storageBucket: "melody-87a48.appspot.com",
	messagingSenderId: "924804843390",
	appId: "1:924804843390:web:7d2f2eb75c9639e93d552f"
};
const app = initializeApp(firebaseConfig);

export function activate(context: vscode.ExtensionContext) {
	const db = getFirestore(app);
	let songsDetail: any[] = [];
	let songsDisplay: any[] = [];
	let song: any;
	let currentWebviewPanel: vscode.WebviewPanel | undefined;
	async function handleCommand(isplay: boolean) {
		if (!isplay) {
			console.log("isPlay", isplay)
			const lang = ['Tamil', 'English', 'Malayalam'];
			const selectedLang = await vscode.window.showQuickPick(lang, { matchOnDetail: true });
			if (selectedLang) {
				songsDetail = [];
				songsDisplay = [];
				let song: any;
				const querySnapshot = await getDocs(collection(db, selectedLang));
				querySnapshot.forEach((doc) => {
					songsDisplay.push(doc.data().title + ' ' + 'from' + ' ' + doc.data().album);
					songsDetail.push(doc.data());
				});
			}

			song = await vscode.window.showQuickPick(songsDisplay, { matchOnDetail: true });
		}
		else {
			songsDetail = [];
			songsDisplay = [];
			const querySnapshot = await getDocs(collection(db, 'Tamil'));
			querySnapshot.forEach((doc) => {
				songsDisplay.push(doc.data().title + ' ' + 'from' + ' ' + doc.data().album);
				songsDetail.push(doc.data());
			});
			song = songsDisplay[Math.floor(Math.random() * (songsDetail.length - 0)) + 0];
		}
		if (song) {
			console.log('song', song)
			const songIndex = songsDisplay.indexOf(song);
			const selectedSong = songsDetail[songIndex];

			if (currentWebviewPanel) {
				// If the panel already exists, just update its content
				updateWebviewContent(currentWebviewPanel, selectedSong);
			} else {
				// If the panel doesn't exist, create a new one
				currentWebviewPanel = createWebviewPanel(selectedSong);
			}
		}
	}
	function updateWebviewContent(panel: vscode.WebviewPanel, selectedSong: any) {
		const audioElement = `<audio id="audio" controls autoplay src="${selectedSong.url}"></audio>`;
		const htmlContent = getHtmlContent(selectedSong, audioElement);

		panel.webview.html = htmlContent;
	}
	function createWebviewPanel(selectedSong: any): vscode.WebviewPanel {
		const audioElement = `<audio id="audio" controls autoplay src="${selectedSong.url}"></audio>`;
		const htmlContent = getHtmlContent(selectedSong, audioElement);
		console.log("audioElement", audioElement, htmlContent)

		const newWebviewPanel = vscode.window.createWebviewPanel(
			'melody-sidebar',
			'isai panel',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
			}
		);

		newWebviewPanel.webview.html = htmlContent;

		// Handle the webview panel's dispose event
		newWebviewPanel.onDidDispose(() => {
			console.log("panel changed")
			currentWebviewPanel = undefined;
		});

		return newWebviewPanel;
	}
	function getHtmlContent(selectedSong: any, audioElement: string): string {
		return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Song Details</title>
    </head>
    <body>
    <style>
    .audio-controls{
      position: absolute;
      right:0;
      bottom:0;
    }
    #toggle-controls{
      background:dodgerblue;
      color:white;
      border:none;
      cursor:pointer;

    }
    .red{
      color: #e0645f;
    }
    .yellow{
      color:#e5c07b;
    }
    .purple{
      color: #c678d2;
    }
    .green{
      color:#98c379;
    }
    .white{
      color: white;
    }
    </style>
    <pre>
    <code>
<span class="red">import</span> music <span class="purple">from</span> heart
<span class="yellow">export</span> <span class="purple">class</span> details()&#123;
<span class="green">const</span> name = <span class="white">${selectedSong.title}</span>;
<span class="green">const</span> album = <span class="white">${selectedSong.album}</span>;
<span class="green">const</span> year = <span class="white">${selectedSong.year}</span>;
<span class="purple">function</span> music_status()&#123;
  <span class="purple">if</span>(music)&#123;
    console.log('playing...');
  &#125;
  <span class="purple">else</span>&#123;
    <span class="purple">return;</span>
&#125;
&#125;
&#125;
    </code>
  </pre>
      <div class="audio-controls-toggle">
<button id="toggle-controls">show ctrl</button>
</div>
<div class="audio-controls" style="display: none;transform:scale(0.5);">
${audioElement}
</div>
      <script>
        const audioElement = document.getElementById('audio');
        const controlsDiv = document.getElementById('controls');
        let show=false;
        // Add your controls HTML and logic here
        // For example: controlsDiv.innerHTML = '<button onclick="playAudio()">Play</button>';
        const toggleButton = document.getElementById('toggle-controls');
        const audioControls = document.querySelector('.audio-controls');
        
        // Add click event listener to toggle button
        toggleButton.addEventListener('click', () => {
          if (audioControls.style.display === 'none') {
            audioControls.style.display = 'block';
          } else {
            audioControls.style.display = 'none';
          }
        });
        // Function to control audio playback
        function playAudio() {
          if (audioElement.paused) {
            audioElement.play();
          } else {
            audioElement.pause();
          }
        }
      </script>
    </body>
    </html>
  `;
	}
	const disposable = vscode.commands.registerCommand('melody.showSongs', async () => {
		handleCommand(false);
	});
	const disposable2 = vscode.commands.registerCommand('melody.playSong', async () => {
		handleCommand(true);
	});
	const disposable3 = vscode.commands.registerCommand('melody.uploadSong', async () => {
		const url = "https://isai-panel.netlify.app/upload";
		vscode.env.openExternal(vscode.Uri.parse(url));
	});
	context.subscriptions.push(disposable, disposable2, disposable3);
}