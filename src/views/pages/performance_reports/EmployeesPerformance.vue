<script setup>
import { EmployeeService } from '@/service/EmployeeService';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, onMounted, ref, watch } from 'vue';

const employees = ref([]);
const employee = ref({});
const selectedEmployee = ref({});
const pieData = ref(null);
const pieOptions = ref(null);

const loading1 = ref(false);
const filters1 = ref([]);

const toast = useToast();

onBeforeMount(() => {
    EmployeeService.getEmployeesXLarge().then((data) => {
        employees.value = data;
        loading1.value = false;
    });

    initFilters1();
});

onMounted(() => {
    setColorOptions();
});

// Watch for changes in selectedEmployee
watch(
    selectedEmployee,
    (newValue) => {
        if (newValue && newValue.tickets) {
            updatePieData();
        }
    },
    { deep: true }
);

function initFilters1() {
    filters1.value = [{ field: 'name', value: '', matchMode: FilterMatchMode.STARTS_WITH, operator: FilterOperator.AND }];
}

function updatePieData() {
    const documentStyle = getComputedStyle(document.documentElement);

    pieData.value = {
        labels: ['Open', 'Resolved', 'Closed'],
        datasets: [
            {
                data: [selectedEmployee.value.tickets?.open || 0, selectedEmployee.value.tickets?.resolved || 0, selectedEmployee.value.tickets?.closed || 0],
                backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-indigo-400'), documentStyle.getPropertyValue('--p-purple-400'), documentStyle.getPropertyValue('--p-teal-400')]
            }
        ]
    };
}

function setColorOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    // Set initial pie data
    updatePieData();

    pieOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor
                }
            }
        }
    };
}
</script>

<template>
    <div class="flex flex-col">
        <div class="card mt-8">
            <div class="font-semibold text-xl mb-4">Employee Performance</div>
            <div class="flex flex-col md:flex-row">
                <div class="w-full md:w-5/12 flex flex-col items-center justify-center gap-3 py-2">
                    <div class="card flex justify-center">
                        <Listbox v-model="selectedEmployee" :options="employees" filter optionLabel="name" class="w-full md:w-full" />
                    </div>
                </div>
                <div class="w-full md:w-2/12">
                    <Divider layout="vertical" class="!hidden md:!flex"><b>-></b></Divider>
                    <Divider layout="horizontal" class="!flex md:!hidden" align="center"><b>-></b></Divider>
                </div>
                <div class="w-full md:w-5/12 flex flex-col items-center justify-center py-5">
                    <div class="col-span-12 xl:col-span-6">
                        <div class="card flex flex-col items-center">
                            <div class="font-semibold text-xl mb-4">Tickets</div>
                            <Chart type="pie" :data="pieData" :options="pieOptions"></Chart>
                        </div>
                    </div>
                    <div>
                        <div class="font-semibold text-xl mb-4">Rating</div>
                        <Rating :modelValue="selectedEmployee.rating" :key="selectedEmployee.employeeId" :stars="10" />
                    </div>
                    <div>
                        <div class="font-semibold text-xl mt-2 mb-4">Resolution Stats</div>
                        <p>
                            Average resolution time: <b>{{ selectedEmployee.avgResolutionTime }}</b>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
