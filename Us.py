from tkinter import *
from functools import partial

from PIL import Image,ImageTk,ImageEnhance



def terms_condition_files(event):
    print(event)
    file=open(r'Terms_condition.txt','w')
    terms_condition="Nothing here....just agree"
    
    file.write(terms_condition)
    file.close()
    
    
    newtkwindow=Toplevel()
    newtkwindow.overrideredirect(True)
    newtkwindow.configure(bg='black')
    
    newtkwindow.geometry('300x300+500+400')
    file=open(r'Terms_condition.txt','r')
    x=file.read()
    prin=Label(newtkwindow,text=x,bg='black',fg='white')
    file.close()
    
    
    Closebutton=Button(newtkwindow ,text='X',fg='red',bg='black', command=newtkwindow.destroy, relief='raised',bd=0,font=' Roboto 10 bold',width=2)
    Closebutton.pack(anchor='ne')
    prin.pack()
    newtkwindow.mainloop()


# Window
tkWindow = Tk()

tkWindow.configure(background='black')

tkWindow.geometry("400x300")
tkWindow.overrideredirect(True)
tkWindow.eval('tk::PlaceWindow . center')


global accept
accept=False
def terms_condition():
    global accept 
    accept=True




def printDetails(usernameEntry) :
    if accept==True:
        usernameText = usernameEntry.get()
        global username
        username=usernameText
        tkWindow.destroy()
    if accept==False:
        after=Label(tkWindow,text='Plese accept the Terms&Condition',bg='black',fg='Red')
        after.place(x=120,y=180)


c=Canvas(tkWindow ,bg='black', height=300, width=400,bd=0,confine=True,)


terms_condition_button=Checkbutton(tkWindow,onvalue = 1,offvalue = 0,bd=0,command=terms_condition,bg='black',activebackground='black',selectcolor='grey')
terms_condition_label=Label(tkWindow,text='Accepting the Terms&Condition',bg='black',fg='white',underline=14)
terms_condition_label.place(x=150,y=150)
terms_condition_button.place(x=135,y=150)

terms_condition_label.bind('<Button-1>',terms_condition_files)


#event binds
def move(event):
    tkWindow.geometry('+{0}+{1}'.format(event.x_root, event.y_root))
tkWindow.bind('<B1-Motion>',move)

def close(event):
   if event.keysym=='Escape':
       tkWindow.quit()
tkWindow.bind('<Escape>',close)
   


#Start of labels
usernameLabel = Label(tkWindow , text="Username" ,font="Helvetica 11 ",bg='black',fg='white',cursor='spraycan')
usernameLabel.place(x=75,y=68)

Img1=Image.open(r'D:\Lilith.jpg')
Img1=Img1.resize((15,15),reducing_gap=1)
Icon=ImageTk.PhotoImage(Img1)

Titleimage=Label(tkWindow,image=Icon)
Titleimage.place(x=5,y=6)

TitleLael=Label(tkWindow,text='Lilith',bg='black',bd=0,font='Helvicta 13 bold',fg='#912f7d')
TitleLael.place(x=30,y=4)


outerusernameentry=Label(height=1,width=17, bg='#e12227',highlightbackground='#e12227',highlightcolor='#e12227',highlightthickness= 0.5,relief='raised')
outerusernameentry.place(x=149,y=68)

hide_canvas_x=Label(height=200,bg='black')



hide_canvas_x.place(x=-3,y=0)
hide_canvas_y=Label(width=150,bg='black')
hide_canvas_y.place(x=0,y=-18)

#End of labels

#Start of Entries
usernameEntry = Entry(tkWindow,background='#c5c5c5',relief='sunken',fg='black')
usernameEntry.place(x=150,y=70)

#end of Entries


printDetailsCallable = partial(printDetails, usernameEntry)

#y=200 so it will be in same axis change only for increasing size
#its draw in canvas of square then takes intial point and final point 390


Car=Image.open(r'D:\supra.jpg')
Car=Car.resize((110,30),reducing_gap=4)
Python_image=ImageTk.PhotoImage(Car)
Car=c.create_image((0,0),image=Python_image)
c.moveto(Car,-120,250)

road=c.create_line((0,0),(500,0),width=2,fill='grey')
c.moveto(road,0,280)




def movement():
    limit=c.coords(Car)
    
    if int(limit[0])<=530:
        i=1
        c.move(Car,i,0)
        
        c.after(10,movement)
    else:
        c.moveto(Car,-130,250)
        
        c.after(0,movement)
        
movement()  

#movement part end here



#Start of BUTTON part

Img=Image.open(r'D:\on.png')
Img=ImageEnhance.Brightness(Img)
Img=Img.enhance(2.0)
Img=ImageEnhance.Color(Img)
Img=Img.enhance(6.0)
Img=ImageEnhance.Sharpness(Img)
Img=Img.enhance(6.5)

Img=Img.resize((85,35),reducing_gap=1)
button=ImageTk.PhotoImage(Img)

submitButton = Button(tkWindow, command= printDetailsCallable , image=button ,bd=0,borderwidth=0,bg='black',cursor='Dotbox',activebackground='black')
submitButton.place(x=170,y=100)

Closebutton=Button(tkWindow ,text='X',fg='red',bg='black', command=tkWindow.destroy, relief='raised',bd=0,font=' Roboto 10 bold',width=2)
Closebutton.place(x=381,y=-2)




#End of button part


c.place(x=0,y=0)

tkWindow.mainloop()
def name():
    File=open(r"Username.txt",'w')
    
    File.write(username)
    File.close()
    
    return username
