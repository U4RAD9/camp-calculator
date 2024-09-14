from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Company,Camp,ServiceSelection,TestData,Service,CostDetails,TestType,ServiceCost,CostSummary
from .serializers import CampSerializer,CompanySerializer,ServiceSelectionSerializer,TestCaseDataSerializer,ServiceSerializer,CostDetailsSerializer,ServiceCostSerializer,CostSummarySerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.views import APIView
from rest_framework import generics
from django.contrib.auth import authenticate,login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.shortcuts import get_object_or_404
from .models import DiscountCoupon
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Estimation
from django.http import HttpResponse, FileResponse
from django.conf import settings
import os
from reportlab.pdfgen import canvas
from django.core.files import File


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

class CampViewSet(viewsets.ModelViewSet):
    queryset = Camp.objects.all()
    serializer_class = CampSerializer


class ServiceSelectionViewSet(viewsets.ModelViewSet):
    queryset = ServiceSelection.objects.all()
    serializer_class = ServiceSelectionSerializer
    

class TestCaseDataViewSet(viewsets.ModelViewSet):
    queryset = TestData.objects.all()
    serializer_class = TestCaseDataSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        # Ensure data is a list of objects
        if not isinstance(data, list):
            return Response({"detail": "Invalid data format. Expected a list of objects."}, status=status.HTTP_400_BAD_REQUEST)

        # Use the serializer to validate and save the data
        serializer = self.get_serializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def list(self, request, *args, **kwargs):
        # Default implementation provided by ModelViewSet
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        # Default implementation provided by ModelViewSet
        return super().retrieve(request, *args, **kwargs)
    


class ServicePriceView(APIView):
    def get(self, request):
        services = Service.objects.all()
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)


class CostDetailsViewSet(viewsets.ViewSet):
    def create(self, request):
        data = request.data
        company_id = data.get('companyId')
        cost_details = data.get('costDetails', {})

        if not company_id:
            return Response({'error': 'Company ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        for service, costs in cost_details.items():
            CostDetails.objects.update_or_create(
                company_id=company_id,
                service_name=service,
                defaults={
                    
                    
                    'food': costs.get('food', 0),
                    
                    'stay': costs.get('stay', 0),
                    
                    'travel': costs.get('travel', 0),

                    'salary': costs.get('salary', 0),

                    'misc': costs.get('misc', 0),

                    'equipment': costs.get('equiment', 0),

                    'consumables': costs.get('consumables', 0),

                    'reporting': costs.get('reporting', 0),
                    
                    
                }
            )

        return Response({'message': 'Costs saved successfully'}, status=status.HTTP_201_CREATED)
    
    # Optionally, add a list method if you need to handle GET requests
    def list(self, request):
        queryset = CostDetails.objects.all()
        serializer = CostDetailsSerializer(queryset, many=True)
        return Response(serializer.data)
    



class ServiceCostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceCost.objects.all()
    serializer_class = ServiceCostSerializer


 

def validate_coupon(request, code):
    coupon = get_object_or_404(DiscountCoupon, code=code)
    return JsonResponse({
        'code': coupon.code,
        'discount_percentage': coupon.discount_percentage,
    })


class PDFUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, *args, **kwargs):
        return Response({'message': 'Use POST to upload a PDF'}, status=405)

    def post(self, request, *args, **kwargs):
        pdf_file = request.FILES.get('pdf')
        company_name = request.data.get('company_name', 'Unknown Company')

        estimation = Estimation.objects.create(
            company_name=company_name,
            pdf_file=pdf_file
        )

        return Response({'message': 'PDF uploaded successfully!', 'pdf_id': estimation.id})


def generate_pdf_view(request):
    # Create a PDF using ReportLab
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="ESTIMATION_Q8ElAn1.pdf"'

    # Create the PDF (Example using ReportLab)
    p = canvas.Canvas(response)
    p.drawString(100, 100, "Hello, this is your PDF.")
    p.showPage()
    p.save()

    # Save the PDF to the specified path
    pdf_dir = os.path.join(settings.MEDIA_ROOT, 'estimations')
    os.makedirs(pdf_dir, exist_ok=True)  # Ensure directory exists
    pdf_path = os.path.join(pdf_dir, 'ESTIMATION_Q8ElAn1.pdf')
    
    with open(pdf_path, 'wb') as f:
        f.write(response.getvalue())

    return response



class CostSummaryViewSet(viewsets.ModelViewSet):
    queryset = CostSummary.objects.all()
    serializer_class = CostSummarySerializer