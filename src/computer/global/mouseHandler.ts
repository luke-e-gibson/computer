export class MouseHandler {
  private _mousePosition: { x: number; y: number } = { x: 0, y: 0 }
  private _mouseDown: boolean = false
  private _mouseUp: boolean = false
  private _isDragging: boolean = false

  constructor() {
    window.addEventListener('mousemove', (event) => {
      this._mousePosition.x = event.clientX
      this._mousePosition.y = event.clientY
      this._isDragging = this._mouseDown
    })

    window.addEventListener('mousedown', (event) => {
      this._mouseDown = true
      this._mouseUp = false
    })

    window.addEventListener('mouseup', (event) => {
      this._mouseDown = false
      this._mouseUp = true
    })
  }

  get mousePosition() {
    return this._mousePosition
  }

  get mouseDown() {
    return this._mouseDown
  }

  get mouseUp() {
    return this._mouseUp
  }

  get isDragging() {
    return this._isDragging
  }

}



