# -*- coding: utf-8 -*-
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms


class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.conv1 = nn.Conv2d(in_channels=1, out_channels=10, kernel_size=3, stride=2)
        self.conv2 = nn.Conv2d(in_channels=10, out_channels=20, kernel_size=3, stride=2)
        self.fc = nn.Linear(4 * 4 * 20, 100)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.max_pool2d(x, kernel_size=1, stride=3)
        x = F.relu(self.conv2(x))
        x = F.max_pool2d(x, kernel_size=1, stride=3)
        x = x.view(-1, 4 * 4 * 20)
        x = F.relu(self.fc(x))
        return x

class GradReverse(torch.autograd.Function):
    def forward(self, x):
        return x.view_as(x)

    def backward(self, grad_output): # 역전파 시에 gradient에 음수를 취함
        return (grad_output * -1)

class domain_classifier(nn.Module):
    def __init__(self):
        super(domain_classifier, self).__init__()
        self.fc1 = nn.Linear(100, 10)
        self.fc2 = nn.Linear(10, 1) # training = 0, real = 1 회귀 가정

    def forward(self, x):
        x = GradReverse.apply(x) # gradient reverse
        x = F.leaky_relu(self.fc1(x))
        x = self.fc2(x)
        return torch.sigmoid(x)

class label_classifier(nn.Module):
    def __init__(self):
        super(label_classifier, self).__init__()
        self.fc1 = nn.Linear(100, 25)
        self.fc2 = nn.Linear(25, 2) # class 개수 = 2개

    def forward(self, x):
        x = F.leaky_relu(self.fc1(x))
        x = self.fc2(x)
        return x

class DANN_CNN(nn.Module):
    def __init__(self):
        super(DANN_CNN, self).__init__()

        self.cnn = CNN() # CNN 구조 모델 받아오기

        self.domain_classifier = domain_classifier() # 도메인 분류 layer

        self.label_classifier = label_classifier() # 결손 비결손 클래스 분류 layer

    def forward(self, img):
        cnn_output = self.cnn(img)

        domain_logits =  self.domain_classifier(cnn_output)

        label_logits = self.label_classifier(cnn_output)

        return domain_logits, label_logits

class DefectFinder:
  def __init__(self,path):
    self.model = torch.load(path)

    
  def hasDefect(self,img):
    transform = transforms.Compose([
        transforms.Grayscale(),
        transforms.ToTensor(),
        transforms.Normalize(0.5,0.5),
    ])
    device = torch.device('cuda:0') if torch.cuda.is_available() else torch.device('cpu')
    transform_img = transform(img).to(device)
    _, confirm_target_logits = self.model(transform_img.reshape(1,1,150,150))
    confirm_target_label = torch.argmax(confirm_target_logits, 1)
    return False if confirm_target_label[0] == 0 else True

