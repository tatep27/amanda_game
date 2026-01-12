// Scene Editor for Amanda Game (Phase 5)
// Simple web-based tool for creating scene JSON manifests

class SceneEditor {
  constructor() {
    this.canvas = document.getElementById('editor-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.currentTool = 'select';
    this.selectedEntity = null;
    this.entities = {
      walls: [],
      npcs: [],
      doors: [],
      spawns: [],
      enemies: []
    };
    this.patrolPointMode = null; // 'a' or 'b' when setting patrol points
    this.gridSize = 16;
    this.gridSnap = true;
    this.dragStart = null;
    this.isDragging = false;
    this.spriteImages = new Map(); // Cache for loaded sprite images
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.render();
    this.loadDefaultScene();
  }

  setupEventListeners() {
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentTool = e.target.dataset.tool;
        this.selectedEntity = null;
        this.render();
      });
    });

    // Canvas events
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Export/Import buttons
    document.getElementById('export-json').addEventListener('click', () => this.exportJSON());
    document.getElementById('import-json').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });
    document.getElementById('file-input').addEventListener('change', (e) => this.importJSON(e));
    document.getElementById('clear-canvas').addEventListener('click', () => this.clearAll());
    
    // Scene selector
    document.getElementById('load-scene').addEventListener('click', () => this.loadScene());
    document.getElementById('new-scene').addEventListener('click', () => this.newScene());

    // Grid snap toggle
    document.getElementById('grid-snap').addEventListener('click', () => {
      this.gridSnap = !this.gridSnap;
      document.getElementById('grid-snap').textContent = `Grid Snap: ${this.gridSnap ? 'ON' : 'OFF'}`;
    });

    // Intro message counter
    const introMessageInput = document.getElementById('intro-message');
    const introMessageInfo = document.getElementById('intro-message-info');
    introMessageInput.addEventListener('input', () => {
      const text = introMessageInput.value;
      const charCount = text.length;
      const pageCount = text ? text.split('~').length : 0;
      introMessageInfo.textContent = `${charCount} characters, ${pageCount} page${pageCount !== 1 ? 's' : ''}`;
    });
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = this.snap(e.clientX - rect.left);
    const y = this.snap(e.clientY - rect.top);

    // Handle patrol point setting mode first (takes priority)
    if (this.patrolPointMode && this.selectedEntity && this.selectedEntity.type === 'enemy') {
      this.setPatrolPoint(x, y);
      return; // Exit early, don't process tool actions
    }

    if (this.currentTool === 'select') {
      this.selectedEntity = this.getEntityAt(x, y);
      this.updatePropertiesPanel();
      this.render();
    } else if (this.currentTool === 'wall') {
      this.dragStart = { x, y };
      this.isDragging = true;
    } else if (this.currentTool === 'npc') {
      this.addNpc(x, y);
    } else if (this.currentTool === 'door') {
      this.addDoor(x, y);
    } else if (this.currentTool === 'spawn') {
      this.addSpawn(x, y);
    } else if (this.currentTool === 'enemy') {
      this.addEnemy(x, y);
    } else if (this.currentTool === 'delete') {
      this.deleteEntityAt(x, y);
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    document.getElementById('mouse-pos').textContent = `Mouse: (${x}, ${y})`;

    if (this.isDragging && this.currentTool === 'wall') {
      this.render();
      const snappedX = this.snap(e.clientX - rect.left);
      const snappedY = this.snap(e.clientY - rect.top);
      this.drawPreviewRect(this.dragStart.x, this.dragStart.y, snappedX - this.dragStart.x, snappedY - this.dragStart.y);
    }
  }

  onMouseUp(e) {
    if (this.isDragging && this.currentTool === 'wall') {
      const rect = this.canvas.getBoundingClientRect();
      const x = this.snap(e.clientX - rect.left);
      const y = this.snap(e.clientY - rect.top);
      this.addWall(this.dragStart.x, this.dragStart.y, x - this.dragStart.x, y - this.dragStart.y);
      this.isDragging = false;
      this.dragStart = null;
    }
  }

  snap(value) {
    if (!this.gridSnap) return value;
    return Math.round(value / this.gridSize) * this.gridSize;
  }

  addWall(x, y, width, height) {
    if (Math.abs(width) < 8 || Math.abs(height) < 8) return;
    
    // Normalize negative dimensions
    if (width < 0) {
      x += width;
      width = Math.abs(width);
    }
    if (height < 0) {
      y += height;
      height = Math.abs(height);
    }

    this.entities.walls.push({ x, y, width, height });
    this.render();
  }

  addNpc(x, y) {
    const id = prompt('Enter NPC ID:', `npc_${this.entities.npcs.length + 1}`);
    if (!id) return;
    
    const characterName = prompt('Enter Character Name:', 'Character');
    if (!characterName) return;
    
    const dialogueText = prompt('Enter Dialogue (use ~ for page breaks):', 'Hello!');
    if (!dialogueText) return;

    const dialogueId = `${id}_dialogue`;

    this.entities.npcs.push({
      id,
      x,
      y,
      spriteKey: 'npc-placeholder',
      dialogueId,
      interactionZoneSize: 64,
      // Editor metadata for dialogue authoring
      characterName,
      dialogueText
    });
    this.render();
  }

  addDoor(x, y) {
    const toSceneKey = prompt('Enter target scene key:', 'OtherScene');
    if (!toSceneKey) return;
    
    const toSpawnId = prompt('Enter spawn ID in target scene:', 'default');
    if (!toSpawnId) return;

    this.entities.doors.push({
      x,
      y,
      toSceneKey,
      toSpawnId,
      promptText: `Press E to enter ${toSceneKey}`
    });
    this.render();
  }

  addSpawn(x, y) {
    const id = prompt('Enter spawn ID:', `spawn_${this.entities.spawns.length + 1}`);
    if (!id) return;

    const facing = prompt('Enter facing direction (up/down/left/right):', 'down');

    this.entities.spawns.push({
      id,
      x,
      y,
      facing: facing || undefined
    });
    this.render();
  }

  addEnemy(x, y) {
    const id = prompt('Enter enemy ID:', `enemy_${this.entities.enemies.length + 1}`);
    if (!id) return;
    
    const behavior = prompt('Enter behavior (patrol/chase/hazard):', 'patrol');
    if (!behavior || !['patrol', 'chase', 'hazard'].includes(behavior)) {
      alert('Invalid behavior. Must be patrol, chase, or hazard.');
      return;
    }
    
    const speed = parseFloat(prompt('Enter speed (pixels/second):', '80'));
    if (isNaN(speed) || speed <= 0) {
      alert('Invalid speed. Must be a positive number.');
      return;
    }

    const enemy = {
      id,
      x,
      y,
      spriteKey: 'enemy-placeholder',
      behavior,
      speed
    };

    // Initialize patrol points for patrol behavior
    // Point A is always the enemy's position, only Point B can be changed
    if (behavior === 'patrol') {
      enemy.patrol = {
        a: { x: x, y: y }, // Point A = spawn position
        b: { x: x + 100, y: y } // Point B = default offset
      };
    }

    this.entities.enemies.push(enemy);
    this.render();
  }

  setPatrolPoint(x, y) {
    if (!this.selectedEntity || this.selectedEntity.type !== 'enemy') return;
    
    const enemy = this.selectedEntity.data;
    if (!enemy.patrol) {
      enemy.patrol = { a: { x: enemy.x, y: enemy.y }, b: { x: 0, y: 0 } };
    }
    
    // Only allow setting Point B (Point A is always the enemy position)
    if (this.patrolPointMode === 'b') {
      enemy.patrol.b = { x, y };
    }
    
    // Always sync Point A to enemy position
    enemy.patrol.a = { x: enemy.x, y: enemy.y };
    
    this.patrolPointMode = null;
    this.updatePropertiesPanel();
    this.render();
  }

  sanitizeSpriteKey(filename) {
    // Remove extension and sanitize: lowercase, replace spaces/special chars with underscores
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric with underscore
      .replace(/_+/g, '_') // Collapse multiple underscores
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }

  handleSpriteUpload(entity, type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const spriteKey = this.sanitizeSpriteKey(file.name);
        entity.spriteKey = spriteKey;
        entity.spriteData = event.target.result; // Store data URL for preview
        entity.spriteFilename = file.name; // Store original filename
        
        // Load image for preview
        const img = new Image();
        img.onload = () => {
          this.spriteImages.set(spriteKey, img);
          this.updatePropertiesPanel();
          this.render();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    };
    
    input.click();
  }

  getEntityAt(x, y) {
    // Check spawns
    for (const spawn of this.entities.spawns) {
      if (Math.abs(spawn.x - x) < 16 && Math.abs(spawn.y - y) < 16) {
        return { type: 'spawn', data: spawn };
      }
    }

    // Check enemies
    for (const enemy of this.entities.enemies) {
      if (Math.abs(enemy.x - x) < 24 && Math.abs(enemy.y - y) < 24) {
        return { type: 'enemy', data: enemy };
      }
    }

    // Check NPCs
    for (const npc of this.entities.npcs) {
      if (Math.abs(npc.x - x) < 24 && Math.abs(npc.y - y) < 24) {
        return { type: 'npc', data: npc };
      }
    }

    // Check doors
    for (const door of this.entities.doors) {
      if (Math.abs(door.x - x) < 24 && Math.abs(door.y - y) < 24) {
        return { type: 'door', data: door };
      }
    }

    // Check walls
    for (const wall of this.entities.walls) {
      if (x >= wall.x && x <= wall.x + wall.width && y >= wall.y && y <= wall.y + wall.height) {
        return { type: 'wall', data: wall };
      }
    }

    return null;
  }

  deleteEntityAt(x, y) {
    const entity = this.getEntityAt(x, y);
    if (!entity) return;

    const list = this.entities[entity.type + 's'] || this.entities[entity.type === 'enemy' ? 'enemies' : entity.type];
    const index = list.indexOf(entity.data);
    if (index > -1) {
      list.splice(index, 1);
      this.render();
    }
  }

  updatePropertiesPanel() {
    const panel = document.getElementById('properties-content');
    
    if (!this.selectedEntity) {
      panel.innerHTML = '<p class="hint">Select an entity to edit properties</p>';
      return;
    }

    const { type, data } = this.selectedEntity;
    let html = `<div class="form-group"><strong>Type:</strong> ${type}</div>`;

    if (type === 'wall') {
      html += `
        <div class="form-group">
          <label>Position:</label>
          <input type="text" value="(${data.x}, ${data.y})" readonly>
        </div>
        <div class="form-group">
          <label>Size:</label>
          <input type="text" value="${data.width} x ${data.height}" readonly>
        </div>
      `;
    } else if (type === 'enemy') {
      html += `
        <div class="form-group">
          <label>ID:</label>
          <input type="text" value="${data.id}" readonly>
        </div>
        <div class="form-group">
          <label>Position:</label>
          <input type="text" value="(${data.x}, ${data.y})" readonly>
        </div>
        <div class="form-group">
          <label>Sprite:</label>
          <input type="text" value="${data.spriteKey || 'enemy-placeholder'}" readonly>
          <button id="upload-sprite" style="width: 100%; margin-top: 0.25rem;">Upload Sprite PNG</button>
          ${data.spriteFilename ? `<small style="color: #4CAF50;">✓ ${data.spriteFilename}</small>` : ''}
        </div>
        <div class="form-group">
          <label>Behavior:</label>
          <select id="enemy-behavior">
            <option value="patrol" ${data.behavior === 'patrol' ? 'selected' : ''}>Patrol</option>
            <option value="chase" ${data.behavior === 'chase' ? 'selected' : ''}>Chase</option>
            <option value="hazard" ${data.behavior === 'hazard' ? 'selected' : ''}>Hazard</option>
          </select>
        </div>
        <div class="form-group">
          <label>Speed (px/s):</label>
          <input type="number" id="enemy-speed" value="${data.speed}" min="0" step="10">
        </div>
      `;
      
      if (data.behavior === 'patrol' && data.patrol) {
        html += `
          <div class="form-group">
            <label>Patrol Point A (spawn position):</label>
            <input type="text" value="(${data.x}, ${data.y})" readonly>
            <small style="color: #a0a0a0;">Point A is locked to enemy position</small>
          </div>
          <div class="form-group">
            <label>Patrol Point B:</label>
            <input type="text" value="(${data.patrol.b.x}, ${data.patrol.b.y})" readonly>
            <button id="set-patrol-b" style="width: 100%; margin-top: 0.25rem;">Set Point B</button>
          </div>
        `;
      }
    } else if (type === 'npc') {
      const pageCount = data.dialogueText ? data.dialogueText.split('~').length : 0;
      html += `
        <div class="form-group">
          <label>ID:</label>
          <input type="text" value="${data.id}" readonly>
        </div>
        <div class="form-group">
          <label>Sprite:</label>
          <input type="text" value="${data.spriteKey || 'npc-placeholder'}" readonly>
          <button id="upload-sprite" style="width: 100%; margin-top: 0.25rem;">Upload Sprite PNG</button>
          ${data.spriteFilename ? `<small style="color: #4CAF50;">✓ ${data.spriteFilename}</small>` : ''}
        </div>
        <div class="form-group">
          <label>Character Name:</label>
          <input type="text" value="${data.characterName || 'Not set'}" readonly>
        </div>
        <div class="form-group">
          <label>Dialogue ID:</label>
          <input type="text" value="${data.dialogueId}" readonly>
        </div>
        <div class="form-group">
          <label>Dialogue Text:</label>
          <textarea readonly style="min-height: 80px;">${data.dialogueText || 'Not set'}</textarea>
          <small style="color: #a0a0a0;">${pageCount} page${pageCount !== 1 ? 's' : ''}</small>
        </div>
        <div class="form-group">
          <label>Position:</label>
          <input type="text" value="(${data.x}, ${data.y})" readonly>
        </div>
      `;
    } else if (type === 'door') {
      html += `
        <div class="form-group">
          <label>To Scene:</label>
          <input type="text" value="${data.toSceneKey}" readonly>
        </div>
        <div class="form-group">
          <label>To Spawn:</label>
          <input type="text" value="${data.toSpawnId}" readonly>
        </div>
        <div class="form-group">
          <label>Position:</label>
          <input type="text" value="(${data.x}, ${data.y})" readonly>
        </div>
      `;
    } else if (type === 'spawn') {
      html += `
        <div class="form-group">
          <label>ID:</label>
          <input type="text" value="${data.id}" readonly>
        </div>
        <div class="form-group">
          <label>Position:</label>
          <input type="text" value="(${data.x}, ${data.y})" readonly>
        </div>
        <div class="form-group">
          <label>Facing:</label>
          <input type="text" value="${data.facing || 'none'}" readonly>
        </div>
      `;
    }

    panel.innerHTML = html;
    
    // Add event listeners for sprite upload (NPCs and enemies)
    if (type === 'enemy' || type === 'npc') {
      const uploadBtn = document.getElementById('upload-sprite');
      if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
          this.handleSpriteUpload(data, type);
        });
      }
    }
    
    // Add event listeners for enemy properties
    if (type === 'enemy') {
      const behaviorSelect = document.getElementById('enemy-behavior');
      const speedInput = document.getElementById('enemy-speed');
      
      if (behaviorSelect) {
        behaviorSelect.addEventListener('change', (e) => {
          data.behavior = e.target.value;
          if (data.behavior === 'patrol' && !data.patrol) {
            data.patrol = {
              a: { x: data.x - 100, y: data.y },
              b: { x: data.x + 100, y: data.y }
            };
          }
          this.updatePropertiesPanel();
          this.render();
        });
      }
      
      if (speedInput) {
        speedInput.addEventListener('change', (e) => {
          data.speed = parseFloat(e.target.value);
          this.render();
        });
      }
      
      const setPatrolB = document.getElementById('set-patrol-b');
      
      if (setPatrolB) {
        setPatrolB.addEventListener('click', () => {
          this.patrolPointMode = 'b';
        });
      }
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();

    // Draw entities
    this.drawWalls();
    this.drawNpcs();
    this.drawEnemies();
    this.drawDoors();
    this.drawSpawns();

    // Draw selection
    if (this.selectedEntity) {
      this.drawSelection(this.selectedEntity);
    }
  }

  drawGrid() {
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawWalls() {
    this.ctx.fillStyle = '#808080';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;

    for (const wall of this.entities.walls) {
      this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
      this.ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
    }
  }

  drawNpcs() {
    for (const npc of this.entities.npcs) {
      // Check if we have a sprite image loaded
      const spriteImg = npc.spriteKey ? this.spriteImages.get(npc.spriteKey) : null;
      
      if (spriteImg) {
        // Draw the actual sprite image centered
        const size = 32; // Default sprite size
        this.ctx.drawImage(spriteImg, npc.x - size/2, npc.y - size/2, size, size);
      } else {
        // Draw placeholder NPC body
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(npc.x, npc.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      // Draw label
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(npc.id, npc.x, npc.y + 35);
    }
  }

  drawDoors() {
    for (const door of this.entities.doors) {
      // Draw door
      this.ctx.fillStyle = '#2196F3';
      this.ctx.fillRect(door.x - 16, door.y - 24, 32, 48);
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(door.x - 16, door.y - 24, 32, 48);

      // Draw arrow
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 20px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('→', door.x, door.y + 5);

      // Draw label
      this.ctx.font = '10px sans-serif';
      this.ctx.fillText(door.toSceneKey, door.x, door.y + 35);
    }
  }

  drawSpawns() {
    for (const spawn of this.entities.spawns) {
      // Draw spawn point (star)
      this.ctx.fillStyle = '#FFC107';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      
      this.ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = spawn.x + Math.cos(angle) * 12;
        const y = spawn.y + Math.sin(angle) * 12;
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Draw label
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '11px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(spawn.id, spawn.x, spawn.y + 25);
    }
  }

  drawEnemies() {
    for (const enemy of this.entities.enemies) {
      // Check if we have a sprite image loaded
      const spriteImg = enemy.spriteKey ? this.spriteImages.get(enemy.spriteKey) : null;
      
      if (spriteImg) {
        // Draw the actual sprite image centered
        const size = 32; // Default sprite size
        this.ctx.drawImage(spriteImg, enemy.x - size/2, enemy.y - size/2, size, size);
      } else {
        // Different colors based on behavior for placeholder
        let color;
        if (enemy.behavior === 'patrol') {
          color = '#FF6B6B'; // Red
        } else if (enemy.behavior === 'chase') {
          color = '#FF9E00'; // Orange
        } else {
          color = '#8B00FF'; // Purple (hazard)
        }

        // Draw placeholder enemy body (diamond/rhombus shape)
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(enemy.x, enemy.y - 20);
        this.ctx.lineTo(enemy.x + 20, enemy.y);
        this.ctx.lineTo(enemy.x, enemy.y + 20);
        this.ctx.lineTo(enemy.x - 20, enemy.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
      }

      // Draw label
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(enemy.id, enemy.x, enemy.y + 35);
      this.ctx.fillText(enemy.behavior, enemy.x, enemy.y + 46);

      // Draw patrol path for patrol enemies
      if (enemy.behavior === 'patrol' && enemy.patrol) {
        this.ctx.strokeStyle = '#FF6B6B';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        // Line between patrol points
        this.ctx.beginPath();
        this.ctx.moveTo(enemy.patrol.a.x, enemy.patrol.a.y);
        this.ctx.lineTo(enemy.patrol.b.x, enemy.patrol.b.y);
        this.ctx.stroke();
        
        // Draw patrol point markers
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(enemy.patrol.a.x - 4, enemy.patrol.a.y - 4, 8, 8);
        this.ctx.fillRect(enemy.patrol.b.x - 4, enemy.patrol.b.y - 4, 8, 8);
        
        // Labels
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px sans-serif';
        this.ctx.fillText('A', enemy.patrol.a.x, enemy.patrol.a.y - 8);
        this.ctx.fillText('B', enemy.patrol.b.x, enemy.patrol.b.y - 8);
        
        this.ctx.setLineDash([]);
      }
    }
  }

  drawSelection(entity) {
    this.ctx.strokeStyle = '#FF00FF';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([5, 5]);

    const { type, data } = entity;

    if (type === 'wall') {
      this.ctx.strokeRect(data.x, data.y, data.width, data.height);
    } else if (type === 'npc' || type === 'door' || type === 'spawn' || type === 'enemy') {
      this.ctx.beginPath();
      this.ctx.arc(data.x, data.y, 30, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.setLineDash([]);
  }

  drawPreviewRect(x, y, width, height) {
    this.ctx.strokeStyle = '#00FF00';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.setLineDash([]);
  }

  exportJSON() {
    const sceneKey = document.getElementById('scene-key').value || 'NewScene';
    const sceneName = document.getElementById('scene-name').value || 'New Scene';
    const bgColor = document.getElementById('bg-color').value;
    const introMessage = document.getElementById('intro-message').value.trim() || null;

    // Create scene manifest (strip editor-only fields from NPCs)
    const manifest = {
      sceneKey,
      name: sceneName,
      backgroundColor: this.colorToHex(bgColor),
      introMessage,
      spawns: this.entities.spawns,
      walls: this.entities.walls,
      npcs: this.entities.npcs.map(npc => ({
        id: npc.id,
        x: npc.x,
        y: npc.y,
        spriteKey: npc.spriteKey || 'npc-placeholder',
        dialogueId: npc.dialogueId,
        interactionZoneSize: npc.interactionZoneSize
      })),
      doors: this.entities.doors,
      enemies: this.entities.enemies.map(enemy => ({
        id: enemy.id,
        x: enemy.x,
        y: enemy.y,
        spriteKey: enemy.spriteKey || 'enemy-placeholder',
        behavior: enemy.behavior,
        speed: enemy.speed,
        patrol: enemy.patrol
      }))
    };

    // Export scene manifest
    this.downloadJSON(manifest, `${sceneKey.toLowerCase()}.json`);

    // Collect all unique sprites that need to be copied
    const spritesNeeded = new Set();
    for (const npc of this.entities.npcs) {
      if (npc.spriteKey && npc.spriteKey !== 'npc-placeholder' && npc.spriteFilename) {
        spritesNeeded.add(`${npc.spriteKey}: ${npc.spriteFilename}`);
      }
    }
    for (const enemy of this.entities.enemies) {
      if (enemy.spriteKey && enemy.spriteKey !== 'enemy-placeholder' && enemy.spriteFilename) {
        spritesNeeded.add(`${enemy.spriteKey}: ${enemy.spriteFilename}`);
      }
    }

    // Create dialogues object from NPCs with dialogue text
    const dialogues = {};
    for (const npc of this.entities.npcs) {
      if (npc.dialogueText && npc.characterName) {
        dialogues[npc.dialogueId] = {
          characterName: npc.characterName,
          lines: npc.dialogueText.split('~').map(line => line.trim())
        };
      }
    }

    // Build export message
    let message = `Exported scene: ${sceneKey.toLowerCase()}.json\n\n`;
    message += `→ Copy to: client/public/data/scenes/\n\n`;

    if (Object.keys(dialogues).length > 0) {
      this.downloadJSON(dialogues, `${sceneKey.toLowerCase()}_dialogues.json`);
      message += `Exported dialogues: ${sceneKey.toLowerCase()}_dialogues.json\n`;
      message += `→ Merge into: client/public/data/dialogues.json\n\n`;
    }

    if (spritesNeeded.size > 0) {
      message += `SPRITES NEEDED:\n`;
      message += `Copy these files to: client/public/assets/sprites/\n\n`;
      spritesNeeded.forEach(sprite => {
        message += `  • ${sprite}\n`;
      });
      message += `\nThen update: client/public/assets/sprites/registry.json`;
    }

    alert(message);

    console.log('Exported scene:', manifest);
    console.log('Exported dialogues:', dialogues);
    console.log('Sprites needed:', Array.from(spritesNeeded));
  }

  downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const manifest = JSON.parse(event.target.result);
        this.loadManifest(manifest);
      } catch (error) {
        alert('Error parsing JSON: ' + error.message);
      }
    };
    reader.readAsText(file);
  }

  loadManifest(manifest) {
    document.getElementById('scene-key').value = manifest.sceneKey || '';
    document.getElementById('scene-name').value = manifest.name || '';
    document.getElementById('bg-color').value = this.hexToColor(manifest.backgroundColor);
    document.getElementById('intro-message').value = manifest.introMessage || '';
    
    // Trigger intro message info update
    const introMessageInput = document.getElementById('intro-message');
    const event = new Event('input');
    introMessageInput.dispatchEvent(event);

    this.entities = {
      walls: manifest.walls || [],
      npcs: manifest.npcs || [],
      doors: manifest.doors || [],
      spawns: manifest.spawns || [],
      enemies: manifest.enemies || []
    };

    this.render();
    console.log('Loaded:', manifest);
  }

  loadScene() {
    const sceneKey = document.getElementById('scene-select').value;
    if (!sceneKey) return;

    const path = `/data/scenes/${sceneKey.toLowerCase()}.json`;
    console.log('[Editor] Loading scene from:', path);
    
    fetch(path)
      .then(res => {
        console.log('[Editor] Fetch response:', res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(manifest => {
        console.log('[Editor] Loaded manifest:', manifest);
        this.loadManifest(manifest);
      })
      .catch(err => {
        console.error('[Editor] Load error:', err);
        alert('Error loading scene: ' + err.message + '\n\nMake sure you\'re opening the editor via http://localhost:3001/editor/ (not file://)');
      });
  }

  newScene() {
    document.getElementById('scene-key').value = '';
    document.getElementById('scene-name').value = '';
    document.getElementById('bg-color').value = '#2a2a4e';
    this.entities = { walls: [], npcs: [], doors: [], spawns: [], enemies: [] };
    this.selectedEntity = null;
    this.render();
  }

  loadDefaultScene() {
    document.getElementById('scene-key').value = 'ExampleScene';
    document.getElementById('scene-name').value = 'Example Scene';
  }

  clearAll() {
    if (!confirm('Clear all entities?')) return;
    this.entities = { walls: [], npcs: [], doors: [], spawns: [], enemies: [] };
    this.selectedEntity = null;
    this.render();
  }

  colorToHex(color) {
    // Convert #RRGGBB to 0xRRGGBB
    return '0x' + color.substring(1);
  }

  hexToColor(hex) {
    // Convert 0xRRGGBB to #RRGGBB
    if (hex.startsWith('0x')) {
      return '#' + hex.substring(2);
    }
    return hex;
  }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SceneEditor();
});

