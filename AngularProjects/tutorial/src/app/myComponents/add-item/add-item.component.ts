import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { existsSync,readFileSync } from 'fs'; //not available in angular
import { Color } from './Color';
//import { COLORS } from './colors';
import { Item } from 'src/app/Item';


/*
using ReactiveFormsModule which is flexible, dynamic and synchronous  
(no binding & easier unit testing)

for FormsModule 
(template driven form features; 
  async, 2way binding "[(ngModel)] syntax", harder unit testing;
  not suitable for complex scenarios)
see https://youtu.be/3dHNOWTI7H8?t=5186
 */



@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {
  @Output() onAddItem: EventEmitter<Item> = new EventEmitter();

  item_text?: string;
  item_description?: string;
  item_color?: string;

  addItemForm: FormGroup;


  defaultColor: string = '#999999';
  selectedColor: string = this.defaultColor;
  colors: Color[] = [{name:"default", value:this.defaultColor}, {name:'custom', value:this.selectedColor}];

  colorsObs?: Observable<Color[]>;
  private colorTextFilePath: string = "assets/colors.json";

  //private colorTextFilePath: string = "assets/colors.txt";
  //private fileContent: string = '';

  constructor (private http: HttpClient, private formBuilder: FormBuilder) { //initialization/declarations done here
    /* //ISSUE: loading via http desync the options,  may need async in ngFor
    this.http.get(this.colorTextFilePath, {responseType: 'text'}).subscribe(data => {
      //console.log(data);
      this.fileContent = data;
      this.fileContent.split('\n').map(line => {
        let colorAndCode: string[] = line.split(',',2);
        if (colorAndCode.length !== 2) return;
        this.colors.push({"name":colorAndCode[0], "value":colorAndCode[1].toLowerCase()});
      });
    });
    */

    //load files via http json and pass the observable to async pipe in separate option ngFor  (good for remote files)
    this.colorsObs = this.http.get<Color[]>(this.colorTextFilePath, {responseType: 'json'});

    //load files locally via import (good for local files)
    //this.colors = this.colors.concat(COLORS);

    this.addItemForm = this.formBuilder.group({
      textControl: new FormControl(''/*defaultValue , {updateOn: 'blur'} */), //can set validator or options
      descriptionControl: new FormControl('' , {updateOn: 'blur'} ),

      colorGroup: new FormGroup({
        colorSelectControl: new FormControl(this.colors[0].value),
        colorCustomControl: new FormControl(this.selectedColor)
      })
    });
    
  }

  ngOnInit() { //work should be done here
    //this.addItemForm.controls['colorGroup'].patchValue({'colorSelectControl': this.colors[0].value});

    this.addItemForm.controls['textControl'].setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(32), Validators.pattern('[a-zA-Z0-9\- ]*')]);
    this.addItemForm.controls['textControl'].updateValueAndValidity();

    this.addItemForm.controls['textControl'].valueChanges.subscribe(change => {
      console.log(`text: ${change}`);
      this.item_text = change;
    });
    this.addItemForm.controls['descriptionControl'].valueChanges.subscribe(change => {
      console.log(`desc: ${change}`);
      this.item_description = change;
    });
  }


  
/* 
this method is simple but only updates values on `blur`.
for practice i will instead use valueUpdate & making use of ReactiveForms, 
which can also be set to update on `blur`

  //(change)="onTextChange($event)"
  onTextChange (event: Event){
    let element: HTMLInputElement = (event.target as HTMLInputElement);
    this.item_text = element.value;
  }
  //(change)="onDescriptionChange($event)"
  onDescriptionChange (event: Event){
    let element: HTMLInputElement = (event.target as HTMLInputElement);
    this.item_description = element.value;
  }
*/

  onSubmit (){
    //can do some validation here, but also can do it with reactiveForms module in the form group using Validators
    console.log(`VALIDITY:\n  text: ${this.addItemForm.controls['textControl'].valid}\n`+
      `  description: ${this.addItemForm.controls['descriptionControl'].valid}\n`+
      `  colorSelect: ${this.addItemForm.controls['colorGroup'].get('colorSelectControl')?.valid}\n`+
      `  colorCustom: ${this.addItemForm.controls['colorGroup'].get('colorSelectControl')?.valid}\n`+
      `form is valid? :  ${this.addItemForm.valid}`);
    if (this.addItemForm.invalid) return; //use ngIf to display something conditionally

    const newItem: Item = { "id": -1 };
    if (this.item_text) newItem['text'] = this.item_text;
    if (this.item_description) newItem['description'] = this.item_description;
    if (this.item_color) newItem['color'] = this.item_color;

    this.onAddItem.emit(newItem);
  }


  onColorSelect ( event: Event ){
    let element: HTMLSelectElement = (event.target as HTMLSelectElement);
    let oldColor = this.selectedColor;
    this.selectedColor = element.value;
    this.item_color = element.value;
    //this.addItemForm.controls['colorGroup'].patchValue({'colorCustomControl': element.value}); //autofills for name, search in colors & colorObs
    this.addItemForm.get(['colorGroup','colorCustomControl'] as const)?.patchValue(element.value);
    console.log(`change color from ${oldColor} to ${this.selectedColor}`);
  }
  onColorCustom (event: Event){
    let element: HTMLInputElement = (event.target as HTMLInputElement);
    let oldColor = this.selectedColor;
    this.selectedColor = element.value;
    this.colors[1].value = element.value;
    this.item_color = element.value;
    //this.addItemForm.controls['colorGroup'].patchValue({'colorSelectControl': this.colors[1].value});
    this.addItemForm.get(['colorGroup','colorSelectControl'] as const)?.patchValue(this.colors[1].value);
    console.log(`custom change color from ${oldColor} to ${this.selectedColor}`);
  }

}
