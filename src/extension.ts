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
	const songsDetail: any[] = [];
	const songsDisplay: any[] = []
	let currentWebviewPanel: vscode.WebviewPanel | undefined;

	const disposable = vscode.commands.registerCommand('melody.showSongs', async () => {
		if (songsDetail.length <= 0) {
			const querySnapshot = await getDocs(collection(db, "songs"));
			querySnapshot.forEach((doc) => {
				songsDisplay.push(doc.data().title + ' ' + 'from' + ' ' + doc.data().album);
				songsDetail.push(doc.data());
			});
		}

		const song = await vscode.window.showQuickPick(songsDisplay, { matchOnDetail: true });

		if (song) {
			if (currentWebviewPanel) {
				currentWebviewPanel.dispose();
			}

			const songIndex = songsDisplay.indexOf(song);
			const selectedSong = songsDetail[songIndex];

			currentWebviewPanel = vscode.window.createWebviewPanel(
				'melody-sidebar',
				'Song Details',
				vscode.ViewColumn.Two,
				{
					enableScripts: true
				}
			);

			const audioElement = `
        <audio id="audio" controls autoplay src="${selectedSong.url}"></audio>
      `;

			const htmlContent = `
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
				</style>
				<pre>
import music from heart
export class details(){
	const name = ${selectedSong.title};
	const album = ${selectedSong.album};
	const year = ${selectedSong.year};
	function music_status(){
		if(music){
			console.log('playing...)
		}
		else{
			return;
		}
	}
}
				</pre>
					<div class="audio-controls-toggle">
  <button id="toggle-controls">Toggle Controls</button>
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

			currentWebviewPanel.webview.html = htmlContent;
		}
	});

	context.subscriptions.push(disposable);
}