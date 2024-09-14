from rest_framework import serializers
from .models import Company,Camp,ServiceSelection,TestData,PriceRange,Service,CostDetails,ServiceCost,CostSummary

class CampSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camp
        fields = '__all__'


class CompanySerializer(serializers.ModelSerializer):
    camps = CampSerializer(many=True, read_only=True)
    
    class Meta:
        model = Company
        fields = '__all__'

class ServiceSelectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceSelection
        fields = ['company_id', 'selected_services']



class TestCaseDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestData
        fields = ['company_id', 'service_name', 'case_per_day', 'number_of_days', 'total_case']

class PriceRangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceRange
        fields = ['max_cases', 'price']

class ServiceSerializer(serializers.ModelSerializer):
    price_ranges = PriceRangeSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = ['name', 'price_ranges']



class CostDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostDetails
        fields = ['company_id', 'service_name', 'travel', 'stay', 'food','salary','misc','equipment','consumables','reporting']


class ServiceCostSerializer(serializers.ModelSerializer):
    test_type_name = serializers.CharField(source='test_type.name', read_only=True)

    class Meta:
        model = ServiceCost
        fields = ['test_type_name', 'salary', 'incentive', 'misc', 'equipment','consumables','reporting']



    
class CostSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = CostSummary
        fields = '__all__'

