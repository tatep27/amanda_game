import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:10',message:'preload() started',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C,D'})}).catch(()=>{});
    // #endregion
    console.log('[PreloadScene] Loading assets...');

    // Create loading text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    });
    this.loadingText.setOrigin(0.5);

    // Set up loading progress display
    this.load.on('progress', (value: number) => {
      this.loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:25',message:'Load progress',data:{progress:value},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C,D'})}).catch(()=>{});
      // #endregion
    });

    // Load scene manifests
    this.load.json('introscene', 'data/scenes/introscene.json');
    this.load.json('ch1', 'data/scenes/ch1.json');
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:29',message:'Queued introscene.json load',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Load dialogue data
    this.load.json('dialogues', 'data/dialogues.json');
    this.load.json('ch1_dialogues', 'data/scenes/ch1_dialogues.json');
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:32',message:'Queued dialogues.json load',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Track file load successes
    this.load.on('filecomplete-json-introscene', () => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:38',message:'introscene.json loaded SUCCESS',data:{hasData:!!this.cache.json.get('introscene')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    });

    this.load.on('filecomplete-json-dialogues', () => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:43',message:'dialogues.json loaded SUCCESS',data:{hasData:!!this.cache.json.get('dialogues')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    });

    // Track load errors
    this.load.on('loaderror', (file: any) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:49',message:'FILE LOAD ERROR',data:{key:file.key,url:file.url,type:file.type},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion
    });

    // Load sprite registry and dynamically load all custom sprites
    this.load.json('spriteRegistry', '/assets/sprites/registry.json');
    
    // Load after registry is available
    this.load.on('filecomplete-json-spriteRegistry', () => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:58',message:'spriteRegistry loaded, processing',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const registry = this.cache.json.get('spriteRegistry');
      if (registry && registry.sprites) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:62',message:'Registry has sprites',data:{spriteCount:Object.keys(registry.sprites).length,sprites:Object.keys(registry.sprites)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        Object.entries(registry.sprites).forEach(([spriteKey, filename]) => {
          this.load.image(spriteKey, `/assets/sprites/${filename}`);
          console.log(`[PreloadScene] Loading sprite: ${spriteKey} -> ${filename}`);
        });
        
        // Create animation AFTER the dynamically loaded sprites finish loading
        this.load.once('complete', () => {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:71',message:'Dynamic sprites load COMPLETE',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C,D'})}).catch(()=>{});
          // #endregion
          console.log('[PreloadScene] Dynamic sprites loaded, creating animation');
          // Create talking animation (2 frames alternating)
          if (this.textures.exists('player_mouth_starting') && 
              this.textures.exists('player_mouth_still')) {
            this.anims.create({
              key: 'player_talking',
              frames: [
                { key: 'player_mouth_starting' },
                { key: 'player_mouth_still' }
              ],
              frameRate: 4, // Slower talking animation
              repeat: -1 // Loop forever
            });
            console.log('[PreloadScene] Created player talking animation');
          } else {
            console.warn('[PreloadScene] Missing textures for talking animation:', {
              mouth_starting: this.textures.exists('player_mouth_starting'),
              mouth_still: this.textures.exists('player_mouth_still')
            });
          }
        });
        
        this.load.start(); // Start loading the sprites
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:94',message:'Called load.start() for dynamic sprites',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }
    });

    // Load assets here in future phases
    // Example: this.load.image('player', 'assets/player.png');
    
    // For now, we have no assets to load, so this will complete immediately
  }

  create(): void {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PreloadScene.ts:80',message:'create() called - starting IntroScene',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D,E'})}).catch(()=>{});
    // #endregion
    console.log('[PreloadScene] Preload complete, starting IntroScene');
    
    // Transition to the intro scene
    this.scene.start('IntroScene');
  }
}

