import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent implements OnInit {
  @Input() text: string = "placeholder";
  @Input() color?: string;
  @Input() textColor?: string;
  @Input() floatAlign?: string;
  //@Input() alert?: string;
  @Output() myButtonClick = new EventEmitter();

  constructor (){}

  ngOnInit(): void {
      
  }

  //onClick() { this.alert ? alert( this.alert ) : null }
  onClick() {
    this.myButtonClick.emit()
  }
}
